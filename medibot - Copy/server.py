from flask import Flask, render_template, request, jsonify, send_from_directory, redirect, url_for, session
import os
import json
import re
import csv
import shutil
from datetime import datetime
from urllib import request as urllib_request
from urllib.error import HTTPError, URLError
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from dotenv import load_dotenv

from appointmentsdb import db, Patient, Appointment, HealthReport

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'medibot-dev-secret')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///medibot.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()


def login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not session.get('user_id'):
            return jsonify({'error': 'Authentication required.'}), 401
        return fn(*args, **kwargs)
    return wrapper


def parse_appointment_datetime(date_str, time_str):
    if not date_str or not time_str:
        raise ValueError('Both date and time are required.')

    combined = f"{date_str} {time_str}"
    for fmt in ('%Y-%m-%d %H:%M', '%Y-%m-%d %I:%M %p'):
        try:
            return datetime.strptime(combined, fmt)
        except ValueError:
            continue

    raise ValueError('Invalid appointment date/time format.')


def derive_specialty_from_doctor_name(doctor_name):
    text = (doctor_name or '').strip()
    if not text:
        return 'Consultation'

    specialist_match = re.search(r'Dr\.\s+(.+?)\s+Specialist$', text, re.IGNORECASE)
    if specialist_match:
        return specialist_match.group(1).strip().title()

    return 'Consultation'

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
"""
Kaggle-related code has been commented out as per user request.
# KAGGLE_DOCTORS_DATASET = os.getenv("KAGGLE_DOCTORS_DATASET", "shivd24coder/us-healthcare-providers-by-cities")
# _default_doctors_data = os.path.join('instance', 'doctors_india.csv') if os.path.exists(os.path.join(app.root_path, 'instance', 'doctors_india.csv')) else os.path.join('instance', 'doctors_kaggle.json')
# _doctors_data_env = os.getenv("DOCTORS_DATA_PATH", _default_doctors_data)
# DOCTORS_DATA_PATH = _doctors_data_env if os.path.isabs(_doctors_data_env) else os.path.join(app.root_path, _doctors_data_env)
"""
INDIA_COUNTRY_CODES = {'in', 'ind'}
INDIA_COUNTRY_NAMES = {'india', 'bharat'}


def normalize_text(value):
    if value is None:
        return ''
    lowered = str(value).lower().strip()
    return re.sub(r'\s+', ' ', lowered)


def safe_join_non_empty(parts):
    return ' '.join([part for part in parts if part]).strip()


def is_india_address(address):
    if not isinstance(address, dict):
        return False

    country_code = normalize_text(address.get('country_code'))
    country_name = normalize_text(address.get('country_name'))
    country = normalize_text(address.get('country'))

    if country_code in INDIA_COUNTRY_CODES:
        return True

    return country_name in INDIA_COUNTRY_NAMES or country in INDIA_COUNTRY_NAMES


def normalize_india_phone(phone):
    phone_text = str(phone or '').strip()
    if not phone_text:
        return 'N/A'

    if phone_text.startswith('+'):
        return phone_text

    digits = ''.join(ch for ch in phone_text if ch.isdigit())
    if len(digits) == 10:
        return f'+91-{digits}'
    return phone_text


def normalize_location_aliases(location_text):
    text = normalize_text(location_text)
    if not text:
        return ''

    alias_map = {
        'bengaluru': 'bangalore',
        'bombay': 'mumbai',
        'madras': 'chennai',
        'calcutta': 'kolkata',
        'gurugram': 'gurgaon',
        'noida': 'noida',
    }

    normalized = text
    for source, target in alias_map.items():
        normalized = re.sub(rf'\b{re.escape(source)}\b', target, normalized)

    return normalized


def build_flat_doctor(record, city_hint=''):
    if not isinstance(record, dict):
        return None

    # Supports both NPI-like schema and flatter Kaggle schemas.
    basic = record.get('basic') or {}
    taxonomies = record.get('taxonomies') or []
    addresses = record.get('addresses') or []

    if not isinstance(addresses, list):
        addresses = []

    location_address = None
    for addr in addresses:
        if isinstance(addr, dict) and normalize_text(addr.get('address_purpose')) == 'location':
            location_address = addr
            break
    if location_address is None and addresses:
        location_address = addresses[0] if isinstance(addresses[0], dict) else None

    if location_address and not is_india_address(location_address):
        return None

    # If no explicit address object is available, rely on record-level country fields.
    record_country = {
        'country': record.get('country') or record.get('Country'),
        'country_code': record.get('country_code') or record.get('CountryCode')
    }
    if not location_address and not is_india_address(record_country):
        return None

    direct_name = str(record.get('Name') or record.get('name') or '').strip()
    first_name = str(basic.get('first_name') or record.get('first_name') or record.get('FirstName') or '').strip().title()
    middle_name = str(basic.get('middle_name') or record.get('middle_name') or '').strip().title()
    last_name = str(basic.get('last_name') or record.get('last_name') or record.get('LastName') or '').strip().title()
    organization_name = str(basic.get('organization_name') or record.get('organization_name') or record.get('hospital_name') or record.get('Hospital') or '').strip().title()
    credential = str(basic.get('credential') or record.get('credential') or '').strip()
    full_name = direct_name or safe_join_non_empty([first_name, middle_name, last_name])
    if full_name and not normalize_text(full_name).startswith('dr.'):
        full_name = f"Dr. {full_name}"
    elif not full_name and organization_name:
        full_name = organization_name
    elif not full_name:
        full_name = f"Dr. Provider {record.get('number', 'Unknown')}"
    if credential:
        full_name = f"{full_name}, {credential}"

    specialty = str(record.get('specialty') or record.get('Speciality') or '').strip() or 'General Physician'
    if specialty == 'General Physician' and taxonomies:
        first_tax = taxonomies[0] if isinstance(taxonomies[0], dict) else {}
        specialty = str(first_tax.get('desc') or specialty).strip()

    location_address = location_address or {}
    existing_address = str(record.get('Address') or record.get('address') or '').strip()
    address_line = safe_join_non_empty([
        str(location_address.get('address_1') or record.get('address_1') or existing_address or '').strip(),
        str(location_address.get('address_2') or record.get('address_2') or '').strip()
    ])
    city = str(location_address.get('city') or record.get('city') or record.get('City') or city_hint or '').strip().title()
    state = str(location_address.get('state') or record.get('state') or record.get('State') or '').strip().title()
    postal_code = str(location_address.get('postal_code') or record.get('postal_code') or record.get('Pincode') or '').strip()
    phone = normalize_india_phone(location_address.get('telephone_number') or record.get('Phone') or record.get('phone'))

    if existing_address:
        address_text = existing_address
        if 'india' not in normalize_text(address_text):
            address_text = f"{address_text}, India"
    else:
        address_text = ', '.join([item for item in [address_line, city, state, postal_code, 'India'] if item])
    if not address_text:
        address_text = 'Address unavailable, India'

    return {
        'Name': full_name,
        'Address': address_text,
        'Rating': str(record.get('Rating') or record.get('rating') or 'Kaggle Verified').strip(),
        'Phone': phone,
        'specialty': specialty,
        'city': city,
        'state': state,
        'postal_code': postal_code,
        'country': 'India'
    }


def find_first_dataset_file(downloaded_dir, file_ext):
    if not os.path.isdir(downloaded_dir):
        return None

    preferred_names = (
        'final_data',
        'doctor',
        'doctors',
        'india',
        'practo',
    )

    candidates = []
    for root, _, files in os.walk(downloaded_dir):
        for file_name in files:
            if file_name.lower().endswith(file_ext):
                full_path = os.path.join(root, file_name)
                lowered = file_name.lower()
                score = sum(1 for token in preferred_names if token in lowered)
                candidates.append((score, full_path))

    if not candidates:
        return None

    candidates.sort(key=lambda item: item[0], reverse=True)
    return candidates[0][1]


def ensure_doctors_data_file(data_path):
    if os.path.exists(data_path):
        return True

    # try:
    #     import kagglehub
    #
    #     downloaded_dir = kagglehub.dataset_download(KAGGLE_DOCTORS_DATASET)
    #     requested_ext = os.path.splitext(data_path)[1].lower()
    #     if requested_ext not in ('.json', '.csv'):
    #         requested_ext = '.json'
    #
    #     source_file = find_first_dataset_file(downloaded_dir, requested_ext)
    #     if not source_file:
    #         fallback_ext = '.csv' if requested_ext == '.json' else '.json'
    #         source_file = find_first_dataset_file(downloaded_dir, fallback_ext)
    #
    #     if not source_file:
    #         return False
    #
    #     os.makedirs(os.path.dirname(data_path), exist_ok=True)
    #     shutil.copyfile(source_file, data_path)
    #     return True
    # except Exception:
    #     return False


def flatten_kaggle_doctors(raw_data):
    flat = []
    if not isinstance(raw_data, list):
        return flat

    for entry in raw_data:
        # Shape A: ["City", {"results": [...]}]
        if isinstance(entry, list) and len(entry) >= 2 and isinstance(entry[1], dict):
            city_hint = str(entry[0] or '').strip()
            records = entry[1].get('results') or []
            for record in records:
                normalized = build_flat_doctor(record, city_hint=city_hint)
                if normalized:
                    flat.append(normalized)
            continue

        # Shape B: [{...}, {...}] flat doctor records.
        normalized = build_flat_doctor(entry)
        if normalized:
            flat.append(normalized)

    return flat


def get_first_non_empty(row, candidate_keys):
    for key in candidate_keys:
        value = row.get(key)
        if value is not None and str(value).strip():
            return str(value).strip()
    return ''


def build_flat_doctor_from_csv(row):
    if not isinstance(row, dict):
        return None

    country = normalize_text(get_first_non_empty(row, [
        'country', 'Country', 'country_name', 'Country Name', 'nation', 'Nation'
    ]))
    country_code = normalize_text(get_first_non_empty(row, [
        'country_code', 'CountryCode', 'country code', 'Country Code'
    ]))

    has_country_metadata = bool(country or country_code)
    if has_country_metadata and country not in INDIA_COUNTRY_NAMES and country_code not in INDIA_COUNTRY_CODES:
        return None

    name = get_first_non_empty(row, [
        'Name', 'name', 'Doctor Name', 'doctor_name', 'Doctor', 'doctor', 'Provider', 'provider_name'
    ])
    if name and not normalize_text(name).startswith('dr.'):
        name = f'Dr. {name}'
    if not name:
        name = 'Dr. Provider Unknown'

    specialty = get_first_non_empty(row, [
        'specialty', 'Specialty', 'Speciality', 'speciality', 'Department', 'department'
    ]) or 'General Physician'

    address_line = get_first_non_empty(row, [
        'address', 'Address', 'address_1', 'Address Line 1', 'clinic_address', 'Clinic Address'
    ])
    city = get_first_non_empty(row, ['city', 'City', 'district', 'District']).title()
    state = get_first_non_empty(row, ['state', 'State', 'region', 'Region']).title()
    postal_code = get_first_non_empty(row, ['postal_code', 'PostalCode', 'Pincode', 'pin_code'])
    rating = get_first_non_empty(row, ['rating', 'Rating', 'review_rating', 'Review Rating']) or 'Kaggle Verified'
    phone = normalize_india_phone(get_first_non_empty(row, [
        'phone', 'Phone', 'contact', 'Contact', 'mobile', 'Mobile', 'telephone_number'
    ]))

    address_text = ', '.join([item for item in [address_line, city, state, postal_code, 'India'] if item])
    if not address_text:
        address_text = 'Address unavailable, India'

    return {
        'Name': name,
        'Address': address_text,
        'Rating': rating,
        'Phone': phone,
        'specialty': specialty,
        'city': city,
        'state': state,
        'postal_code': postal_code,
        'country': 'India'
    }


def load_doctors_from_csv_file(file_path):
    flat = []
    with open(file_path, 'r', encoding='utf-8-sig', newline='') as file:
        reader = csv.DictReader(file)
        for row in reader:
            normalized = build_flat_doctor_from_csv(row)
            if normalized:
                flat.append(normalized)
    return flat


def load_doctors_dataset():
    data_path = DOCTORS_DATA_PATH
    if not ensure_doctors_data_file(data_path):
        return []

    try:
        extension = os.path.splitext(data_path)[1].lower()

        if extension == '.csv':
            return load_doctors_from_csv_file(data_path)

        with open(data_path, 'r', encoding='utf-8') as file:
            raw = json.load(file)
        return flatten_kaggle_doctors(raw)
    except Exception:
        # Some Kaggle datasets may be CSV content even when copied to a .json target path.
        try:
            return load_doctors_from_csv_file(data_path)
        except Exception:
            return []


def score_doctor_match(doctor, specialty_query, location_query):
    specialty_text = normalize_text(doctor.get('specialty'))
    doctor_location = normalize_text(' '.join([
        str(doctor.get('city') or ''),
        str(doctor.get('state') or ''),
        str(doctor.get('postal_code') or ''),
        str(doctor.get('Address') or '')
    ]))

    specialty_query = normalize_text(specialty_query)
    location_query = normalize_location_aliases(location_query)

    specialty_score = 0
    location_score = 0

    if specialty_query and specialty_query in specialty_text:
        specialty_score = 2
    else:
        specialty_tokens = [token for token in specialty_query.split(' ') if token]
        if specialty_tokens and any(token in specialty_text for token in specialty_tokens):
            specialty_score = 1

    if location_query and location_query in doctor_location:
        location_score = 2
    else:
        stop_words = {'new', 'near', 'city', 'area', 'my', 'the', 'in'}
        location_tokens = [
            token for token in location_query.split(' ')
            if token and len(token) >= 2 and token not in stop_words
        ]
        if location_tokens:
            matched_tokens = [token for token in location_tokens if token in doctor_location]
            if matched_tokens:
                location_score = 2 if len(matched_tokens) == len(location_tokens) else 1

    return specialty_score, location_score


def parse_doctor_quality_score(doctor):
    rating_text = normalize_text(doctor.get('Rating'))
    if not rating_text:
        return 0.0

    score = 0.0

    percent_match = re.search(r'(\d+(?:\.\d+)?)\s*%', rating_text)
    if percent_match:
        score += float(percent_match.group(1))

    stars_match = re.search(r'\b(\d(?:\.\d+)?)\b', rating_text)
    if stars_match:
        stars = float(stars_match.group(1))
        if 0 < stars <= 5:
            score += stars * 18

    patients_match = re.search(r'(\d+)\s*patients?', rating_text)
    if patients_match:
        score += min(int(patients_match.group(1)), 3000) * 0.04

    exp_raw = doctor.get('experience_years')
    try:
        score += float(exp_raw or 0) * 0.3
    except Exception:
        pass

    return score


def find_local_doctors(specialty, location, limit=5, strict_location=False):
    all_doctors = load_doctors_dataset()
    if not all_doctors:
        return []

    scored = []
    for doctor in all_doctors:
        specialty_score, location_score = score_doctor_match(doctor, specialty, location)
        if specialty_score > 0 and location_score > 0:
            quality_score = parse_doctor_quality_score(doctor)
            scored.append((location_score, specialty_score, quality_score, doctor))

    if not scored and not strict_location:
        for doctor in all_doctors:
            specialty_score, _ = score_doctor_match(doctor, specialty, location)
            if specialty_score > 0:
                quality_score = parse_doctor_quality_score(doctor)
                scored.append((0, specialty_score, quality_score, doctor))

    scored.sort(key=lambda item: (item[0], item[1], item[2], item[3].get('Name', '')), reverse=True)
    return [item[3] for item in scored[:limit]]


def infer_specialty_from_problem(problem_text):
    text = normalize_text(problem_text)
    if not text:
        return 'general physician'

    specialty_rules = [
        ('cardiologist', ['chest pain', 'heart', 'bp', 'blood pressure', 'palpitation']),
        ('dermatologist', ['skin', 'rash', 'acne', 'itch', 'allergy']),
        ('neurologist', ['headache', 'migraine', 'dizziness', 'seizure', 'numbness']),
        ('orthopedic', ['bone', 'joint', 'knee', 'back pain', 'fracture', 'shoulder']),
        ('pediatrician', ['child', 'baby', 'infant', 'kid', 'newborn']),
        ('gastroenterologist', ['stomach', 'acidity', 'gas', 'vomit', 'nausea', 'diarrhea']),
        ('pulmonologist', ['cough', 'breath', 'asthma', 'lungs', 'respiratory']),
        ('ent specialist', ['ear', 'nose', 'throat', 'sinus']),
        ('gynecologist', ['period', 'pregnan', 'pcod', 'pcos', 'uterus', 'ovary']),
        ('psychiatrist', ['anxiety', 'depression', 'stress', 'panic', 'sleep disorder']),
        ('dentist', ['tooth', 'teeth', 'gum', 'dental', 'jaw pain']),
    ]

    for specialty, keywords in specialty_rules:
        if any(keyword in text for keyword in keywords):
            return specialty

    return 'general physician'


def pick_best_doctors_for_problem(problem, location, specialty='', limit=4):
    selected_specialty = normalize_text(specialty) or infer_specialty_from_problem(problem)

    def merge_unique(primary, secondary, max_items):
        merged = []
        seen = set()

        for item in (primary or []) + (secondary or []):
            key = f"{normalize_text(item.get('Name'))}|{normalize_text(item.get('Address'))}"
            if key in seen:
                continue
            seen.add(key)
            merged.append(item)
            if len(merged) >= max_items:
                break

        return merged

    doctors = []
    location_mode = 'none'

    exact_doctors = find_local_doctors(selected_specialty, location, limit=limit, strict_location=True)
    if exact_doctors:
        doctors = exact_doctors
        location_mode = 'exact'
    elif normalize_text(selected_specialty) != 'general physician':
        exact_general = find_local_doctors('general physician', location, limit=limit, strict_location=True)
        if exact_general:
            doctors = exact_general
            selected_specialty = 'general physician'
            location_mode = 'exact'

    if len(doctors) < limit:
        broad_fill = find_local_doctors(selected_specialty, location, limit=limit, strict_location=False)
        before = len(doctors)
        doctors = merge_unique(doctors, broad_fill, limit)
        if len(doctors) > before and location_mode == 'none':
            location_mode = 'broad'

    if len(doctors) < limit and normalize_text(selected_specialty) != 'general physician':
        gp_fill = find_local_doctors('general physician', location, limit=limit, strict_location=False)
        before = len(doctors)
        doctors = merge_unique(doctors, gp_fill, limit)
        if len(doctors) > before and location_mode == 'none':
            location_mode = 'broad'

    if len(doctors) < limit:
        nationwide_fill = find_local_doctors(selected_specialty, '', limit=limit, strict_location=False)
        before = len(doctors)
        doctors = merge_unique(doctors, nationwide_fill, limit)
        if len(doctors) > before:
            location_mode = 'mixed' if location_mode == 'exact' else 'nationwide'

    if len(doctors) < limit and normalize_text(selected_specialty) != 'general physician':
        nationwide_gp_fill = find_local_doctors('general physician', '', limit=limit, strict_location=False)
        before = len(doctors)
        doctors = merge_unique(doctors, nationwide_gp_fill, limit)
        if len(doctors) > before:
            location_mode = 'mixed' if location_mode == 'exact' else 'nationwide'

    return doctors, selected_specialty, location_mode


def extract_gemini_text(payload):
    candidates = payload.get('candidates') or []
    if not candidates:
        return ''

    parts = ((candidates[0].get('content') or {}).get('parts') or [])
    texts = [part.get('text', '') for part in parts if isinstance(part, dict)]
    return '\n'.join([item for item in texts if item]).strip()


def parse_json_from_text(text):
    if not text:
        return None

    cleaned = text.strip().replace('```json', '').replace('```', '').strip()
    try:
        return json.loads(cleaned)
    except Exception:
        pass

    match = re.search(r'\{[\s\S]*\}', cleaned)
    if not match:
        return None

    try:
        return json.loads(match.group(0))
    except Exception:
        return None


def fallback_symptom_analysis(symptoms, duration='', severity='', existing_diseases='', current_medications=''):
    text = (symptoms or '').lower()
    severity_text = (severity or '').strip().lower()
    duration_text = (duration or '').strip().lower()
    disease_text = (existing_diseases or '').strip().lower()

    urgency = 'low'
    specialist = 'General Physician'
    possible_conditions = ['Viral infection']
    recommendations = [
        'Stay hydrated and rest adequately.',
        'Track symptom progression every 6-8 hours.',
        'Avoid self-medication without proper advice.'
    ]
    red_flags = [
        'Difficulty breathing or chest pain',
        'Persistent high fever above 102°F',
        'Confusion, severe weakness, or dehydration signs'
    ]

    if any(token in text for token in ['chest pain', 'breath', 'stroke', 'seizure', 'unconscious', 'bleeding']):
        urgency = 'emergency'
        specialist = 'Emergency Medicine'
        possible_conditions = ['Potential emergency condition']
        recommendations = [
            'Call emergency services immediately (108/112).',
            'Do not delay in-person medical care.',
            'Share exact symptom onset time with responders.'
        ]
    elif any(token in text for token in ['fever', 'cough', 'cold', 'sore throat']):
        urgency = 'medium'
        specialist = 'General Physician'
        possible_conditions = ['Upper respiratory infection', 'Viral fever']
    elif any(token in text for token in ['headache', 'migraine', 'dizziness']):
        urgency = 'medium'
        specialist = 'Neurologist'
        possible_conditions = ['Migraine', 'Tension headache']
    elif any(token in text for token in ['stomach', 'acidity', 'vomit', 'nausea']):
        urgency = 'medium'
        specialist = 'Gastroenterologist'
        possible_conditions = ['Gastritis', 'Acid reflux']

    if severity_text == 'severe' and urgency in ('low', 'medium'):
        urgency = 'high'
    if duration_text in ('more-than-week', '4-7-days') and urgency == 'low':
        urgency = 'medium'
    if any(token in disease_text for token in ['diabetes', 'asthma', 'heart', 'hypertension', 'kidney']) and urgency in ('low', 'medium'):
        urgency = 'high'

    recommendations.append('Share your symptom duration, severity, existing diseases, and current medicines during doctor consultation.')
    if current_medications:
        recommendations.append('Do not stop prescribed medicines abruptly without clinician advice.')

    return {
        'summary': 'Preliminary triage based on provided symptoms. This is not a medical diagnosis.',
        'specialistType': specialist,
        'urgency': urgency,
        'possibleConditions': possible_conditions,
        'recommendations': recommendations,
        'redFlags': red_flags,
        'confidence': 'medium',
        'sources': []
    }

# Route for the homepage
@app.route('/')
def home():
    if session.get('user_id'):
        return redirect(url_for('portal_page'))
    return redirect(url_for('login_page'))


@app.route('/portal')
@app.route('/portal.html')
def portal_page():
    return render_template('portal.html')


@app.route('/login')
@app.route('/login.html')
def login_page():
    return render_template('login.html')

# Route for appointments page
@app.route('/appointments')
def appointments():
    return render_template('appointments/index.html')


@app.route('/register', methods=['POST'])
def register_user():
    data = request.get_json(silent=True) or {}

    first_name = (data.get('firstName') or '').strip()
    last_name = (data.get('lastName') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    phone = (data.get('phone') or '').strip()
    gender = (data.get('gender') or '').strip()

    age_value = data.get('age')
    try:
        age = int(age_value) if age_value not in (None, '', 'null') else 18
    except (TypeError, ValueError):
        return jsonify({'error': 'Age must be a number.'}), 400

    if not first_name or not last_name or not email or not password or not gender:
        return jsonify({'error': 'firstName, lastName, email, password, and gender are required.'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long.'}), 400

    if age < 1 or age > 120:
        return jsonify({'error': 'Age must be between 1 and 120.'}), 400

    existing_patient = Patient.query.filter_by(email=email).first()
    if existing_patient:
        return jsonify({'error': 'An account with this email already exists.'}), 409

    patient = Patient(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=generate_password_hash(password),
        phone=phone,
        age=age,
        gender=gender,
    )

    db.session.add(patient)
    db.session.commit()

    return jsonify({'message': 'Registration successful!', 'id': patient.id}), 201


@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    patient = Patient.query.filter_by(email=email).first()
    if not patient or not check_password_hash(patient.password, password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    session['user_id'] = patient.id
    session['user_email'] = patient.email

    return jsonify({
        'message': 'Login successful!',
        'user': {
            'id': patient.id,
            'firstName': patient.first_name,
            'lastName': patient.last_name,
            'email': patient.email,
            'phone': patient.phone,
            'age': patient.age,
            'gender': patient.gender,
        }
    }), 200


@app.route('/logout', methods=['POST'])
def logout_user():
    session.clear()
    return jsonify({'message': 'Logged out successfully.'}), 200


@app.route('/api/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'authenticated': False}), 200

    patient = db.session.get(Patient, user_id)
    if not patient:
        session.clear()
        return jsonify({'authenticated': False}), 200

    return jsonify({
        'authenticated': True,
        'user': {
            'id': patient.id,
            'firstName': patient.first_name,
            'lastName': patient.last_name,
            'email': patient.email,
            'phone': patient.phone,
            'age': patient.age,
            'gender': patient.gender,
        }
    }), 200


@app.route('/api/appointments', methods=['GET'])
@login_required
def list_appointments():
    user_id = session['user_id']
    appointments = (
        Appointment.query
        .filter_by(patient_id=user_id)
        .order_by(Appointment.appointment_date.asc())
        .all()
    )

    return jsonify([
        {
            'id': item.id,
            'patient_id': item.patient_id,
            'doctor_name': item.doctor_name,
            'date': item.appointment_date.strftime('%Y-%m-%d'),
            'time': item.appointment_date.strftime('%I:%M %p'),
            'datetime': item.appointment_date.isoformat(),
            'reason': item.symptoms or '',
            'specialty': derive_specialty_from_doctor_name(item.doctor_name),
            'status': item.status,
            'location': 'Medical Center'
        }
        for item in appointments
    ]), 200


@app.route('/api/appointments', methods=['POST'])
@login_required
def create_appointment():
    data = request.get_json(silent=True) or {}
    specialty = (data.get('specialty') or '').strip()
    doctor_name = (data.get('doctor_name') or '').strip()
    date_str = (data.get('date') or '').strip()
    time_str = (data.get('time') or '').strip()
    reason = (data.get('reason') or '').strip()

    if not specialty or not date_str or not time_str:
        return jsonify({'error': 'specialty, date and time are required.'}), 400

    try:
        appointment_dt = parse_appointment_datetime(date_str, time_str)
    except ValueError as err:
        return jsonify({'error': str(err)}), 400

    final_doctor_name = doctor_name or f'Dr. {specialty.title()} Specialist'

    appointment = Appointment(
        patient_id=session['user_id'],
        doctor_name=final_doctor_name,
        appointment_date=appointment_dt,
        symptoms=reason,
        status='Scheduled'
    )

    db.session.add(appointment)
    db.session.commit()

    return jsonify({
        'message': 'Appointment booked successfully.',
        'appointment': {
            'id': appointment.id,
            'patient_id': appointment.patient_id,
            'doctor_name': final_doctor_name,
            'date': appointment.appointment_date.strftime('%Y-%m-%d'),
            'time': appointment.appointment_date.strftime('%I:%M %p'),
            'datetime': appointment.appointment_date.isoformat(),
            'reason': appointment.symptoms or '',
            'specialty': specialty.title(),
            'status': appointment.status,
            'location': 'Medical Center'
        }
    }), 201


@app.route('/api/appointments/<int:appointment_id>', methods=['PUT'])
@login_required
def update_appointment(appointment_id):
    data = request.get_json(silent=True) or {}
    appointment = Appointment.query.filter_by(id=appointment_id, patient_id=session['user_id']).first()

    if not appointment:
        return jsonify({'error': 'Appointment not found.'}), 404

    specialty = (data.get('specialty') or '').strip()
    doctor_name = (data.get('doctor_name') or '').strip()
    date_str = (data.get('date') or '').strip()
    time_str = (data.get('time') or '').strip()
    reason = (data.get('reason') or '').strip()

    if doctor_name:
        appointment.doctor_name = doctor_name
    elif specialty:
        appointment.doctor_name = f'Dr. {specialty.title()} Specialist'
    if date_str or time_str:
        try:
            appointment.appointment_date = parse_appointment_datetime(
                date_str or appointment.appointment_date.strftime('%Y-%m-%d'),
                time_str or appointment.appointment_date.strftime('%I:%M %p')
            )
        except ValueError as err:
            return jsonify({'error': str(err)}), 400
    if reason:
        appointment.symptoms = reason

    db.session.commit()

    return jsonify({
        'message': 'Appointment updated successfully.',
        'appointment': {
            'id': appointment.id,
            'patient_id': appointment.patient_id,
            'doctor_name': appointment.doctor_name,
            'date': appointment.appointment_date.strftime('%Y-%m-%d'),
            'time': appointment.appointment_date.strftime('%I:%M %p'),
            'datetime': appointment.appointment_date.isoformat(),
            'reason': appointment.symptoms or '',
            'specialty': specialty.title() if specialty else derive_specialty_from_doctor_name(appointment.doctor_name),
            'status': appointment.status,
            'location': 'Medical Center'
        }
    }), 200


@app.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
@login_required
def delete_appointment(appointment_id):
    appointment = Appointment.query.filter_by(id=appointment_id, patient_id=session['user_id']).first()

    if not appointment:
        return jsonify({'error': 'Appointment not found.'}), 404

    db.session.delete(appointment)
    db.session.commit()
    return jsonify({'message': 'Appointment cancelled successfully.'}), 200


@app.route('/api/reports', methods=['GET'])
@login_required
def list_reports():
    reports = (
        HealthReport.query
        .filter_by(patient_id=session['user_id'])
        .order_by(HealthReport.created_at.desc())
        .all()
    )

    return jsonify([
        {
            'id': item.id,
            'patient_id': item.patient_id,
            'createdAt': item.created_at.isoformat(),
            'riskLevel': item.risk_level,
            'heartRate': item.heart_rate,
            'temperature': item.temperature,
            'bmi': item.bmi,
            'activeSymptomsCount': item.active_symptoms_count,
            'upcomingAppointments': item.upcoming_appointments,
            'clinicalNote': item.clinical_note,
        }
        for item in reports
    ]), 200


@app.route('/api/reports', methods=['POST'])
@login_required
def create_report():
    data = request.get_json(silent=True) or {}

    risk_level = (data.get('riskLevel') or 'Low').strip().title()
    if risk_level not in ('Low', 'Medium', 'High'):
        risk_level = 'Low'

    temperature = str(data.get('temperature') or '98.6 F').strip()
    clinical_note = (data.get('clinicalNote') or 'No note available.').strip()

    def as_float(value, fallback):
        try:
            return float(value)
        except (TypeError, ValueError):
            return fallback

    def as_int(value, fallback):
        try:
            return int(value)
        except (TypeError, ValueError):
            return fallback

    report = HealthReport(
        patient_id=session['user_id'],
        risk_level=risk_level,
        heart_rate=as_float(data.get('heartRate'), 72.0),
        temperature=temperature,
        bmi=as_float(data.get('bmi'), 23.2),
        active_symptoms_count=as_int(data.get('activeSymptomsCount'), 0),
        upcoming_appointments=as_int(data.get('upcomingAppointments'), 0),
        clinical_note=clinical_note[:500],
    )

    db.session.add(report)
    db.session.commit()

    return jsonify({
        'message': 'Health report saved successfully.',
        'report': {
            'id': report.id,
            'patient_id': report.patient_id,
            'createdAt': report.created_at.isoformat(),
            'riskLevel': report.risk_level,
            'heartRate': report.heart_rate,
            'temperature': report.temperature,
            'bmi': report.bmi,
            'activeSymptomsCount': report.active_symptoms_count,
            'upcomingAppointments': report.upcoming_appointments,
            'clinicalNote': report.clinical_note,
        }
    }), 201

# Example upload route (for upload.js)
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    filename = os.path.basename((file.filename or '').strip())
    if not filename:
        return jsonify({'error': 'Please choose a file before uploading'}), 400

    # Prevent accidental overwrite by adding numeric suffix when needed.
    upload_folder = os.path.join(app.root_path, 'uploads')
    os.makedirs(upload_folder, exist_ok=True)

    name, ext = os.path.splitext(filename)
    candidate = filename
    counter = 1
    while os.path.exists(os.path.join(upload_folder, candidate)):
        candidate = f"{name}_{counter}{ext}"
        counter += 1

    file_path = os.path.join(upload_folder, candidate)
    file.save(file_path)

    return jsonify({
        'message': f'{candidate} uploaded successfully!',
        'filename': candidate,
        'fileUrl': f'/uploads/{candidate}'
    })


@app.route('/uploads/<path:filename>')
def serve_uploaded_file(filename):
    safe_name = os.path.basename(filename)
    upload_folder = os.path.join(app.root_path, 'uploads')
    return send_from_directory(upload_folder, safe_name)

# Serve static files
@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)


@app.route('/api/doctors', methods=['POST'])
def get_doctors():
    data = request.get_json(silent=True) or {}
    specialty = (data.get('specialty') or '').strip()
    problem = (data.get('problem') or '').strip()
    location = (data.get('location') or '').strip()

    if not location:
        return jsonify({'error': 'Location is required.'}), 400

    selected_specialty = specialty or infer_specialty_from_problem(problem)
    if not selected_specialty:
        return jsonify({'error': 'Provide specialty or problem for doctor search.'}), 400

    # local_doctors = find_local_doctors(selected_specialty, location, strict_location=True)
    # fallback_used = False
    # if not local_doctors and normalize_text(selected_specialty) != 'general physician':
    #     local_doctors = find_local_doctors('general physician', location, strict_location=True)
    #     if local_doctors:
    #         selected_specialty = 'general physician'
    #         fallback_used = True
    #
    # if local_doctors:
    #     return jsonify({
    #         'source': 'kaggle',
    #         'specialty': selected_specialty,
    #         'fallback_used': fallback_used,
    #         'doctors': local_doctors,
    #         'count': len(local_doctors)
    #     }), 200
    #
    # return jsonify({
    #     'error': 'No India doctors found in Kaggle dataset for the given problem/specialty in this location.',
    #     'source': 'kaggle',
    #     'specialty': selected_specialty,
    #     'india_only': True,
    #     'hint': 'Ensure DOCTORS_DATA_PATH points to an India doctors Kaggle JSON file.'
    # }), 404


@app.route('/api/doctor-suggestion', methods=['POST'])
def suggest_doctor_for_appointment():
    data = request.get_json(silent=True) or {}
    problem = (data.get('problem') or '').strip()
    location = (data.get('location') or '').strip()
    specialty = (data.get('specialty') or '').strip()

    if not location:
        return jsonify({'error': 'Location is required for doctor suggestion.'}), 400

    doctors, selected_specialty, location_mode = pick_best_doctors_for_problem(problem, location, specialty, limit=4)

    # if not doctors:
    #     return jsonify({
    #         'error': 'No suitable doctor found in Kaggle dataset for the given location and problem.',
    #         'specialty': selected_specialty,
    #         'source': 'kaggle'
    #     }), 404
    #
    # primary_doctor = doctors[0]
    #
    # return jsonify({
    #     'source': 'kaggle',
    #     'specialty': selected_specialty,
    #     'doctor': primary_doctor,
    #     'doctors': doctors,
    #     'count': len(doctors),
    #     'location_mode': location_mode,
    #     'message': 'Top doctor suggestions generated from Kaggle dataset for your location and problem.'
    # }), 200


@app.route('/api/chat', methods=['POST'])
def chat_with_ai():
    data = request.get_json(silent=True) or {}
    message = (data.get('message') or '').strip()
    context = (data.get('context') or '').strip()
    api_key = (data.get('apiKey') or GEMINI_API_KEY or '').strip()
    language = (data.get('language') or 'hi').strip()

    if not message:
        return jsonify({'error': 'Message is required.'}), 400

    if not api_key:
        return jsonify({'error': 'Missing Gemini API key. Set GEMINI_API_KEY on the server or provide apiKey in request payload.'}), 500

    if language == 'hi':
        lang_instruction = (
            'IMPORTANT: You MUST reply ONLY in Hindi (Devanagari script). '
            'Do NOT write in English at all. Use clear, simple Hindi that a patient can easily understand. '
        )
    else:
        lang_instruction = 'Respond in English. '

    system_prompt = (
        'You are Dr. AI Assistant for a healthcare portal. '
        + lang_instruction +
        'When the user asks for treatment/help steps, provide complete actionable guidance with sections: '\
        'possible causes, what to do now, medicines/home care, red flags, and when to see a doctor. '
        'Use bullet points when useful. '
        'If symptoms suggest emergency risk (e.g., chest pain, severe breathlessness, stroke signs), '
        'instruct the user to call emergency services immediately. '
        'Do not provide a final diagnosis; provide educational guidance and when to seek in-person care. '
        'Avoid over-short replies; give a complete answer between 180 and 420 words unless user asks for short answer.'
    )

    user_text = f"User message: {message}"
    if context:
        user_text += f"\n\nAdditional context: {context}"

    payload = {
        'contents': [{'parts': [{'text': user_text}]}],
        'systemInstruction': {'parts': [{'text': system_prompt}]},
        'generationConfig': {'temperature': 0.4, 'maxOutputTokens': 800}
    }

    endpoint = f"{GEMINI_API_URL}?key={api_key}"

    def run_gemini_request(request_payload, timeout=30):
        req = urllib_request.Request(
            endpoint,
            data=json.dumps(request_payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib_request.urlopen(req, timeout=timeout) as response:
            raw_body = response.read().decode('utf-8')
            parsed = json.loads(raw_body)
            return extract_gemini_text(parsed), parsed

    try:
        reply, _ = run_gemini_request(payload)
        if not reply:
            return jsonify({'error': 'Gemini returned an empty response.'}), 502

        # Auto-expand short answers so users receive complete guidance.
        if len(reply.strip()) < 260:
            expansion_text = (
                f"User question: {message}\n\n"
                f"Initial draft answer: {reply}\n\n"
                "Rewrite and expand the answer with complete guidance. "
                "Include: likely causes, immediate care steps, medicine/home-care options, warning signs, "
                f"and when to consult a doctor. Keep it practical. {'Use Hindi (Devanagari) only.' if language == 'hi' else 'Use English only.'}"
            )
            expansion_payload = {
                'contents': [{'parts': [{'text': expansion_text}]}],
                'systemInstruction': {'parts': [{'text': system_prompt}]},
                'generationConfig': {'temperature': 0.35, 'maxOutputTokens': 900}
            }
            expanded_reply, _ = run_gemini_request(expansion_payload, timeout=35)
            if expanded_reply and len(expanded_reply.strip()) > len(reply.strip()) + 80:
                reply = expanded_reply

        return jsonify({'reply': reply}), 200
    except HTTPError as http_err:
        error_body = ''
        upstream_message = ''
        try:
            error_body = http_err.read().decode('utf-8')
            parsed = json.loads(error_body)
            upstream_message = parsed.get('error', {}).get('message', '')
        except Exception:
            pass

        return jsonify({
            'error': upstream_message or f'Gemini request failed with status {http_err.code}.',
            'details': error_body
        }), http_err.code
    except URLError as url_err:
        return jsonify({'error': f'Network error while contacting Gemini: {url_err.reason}'}), 502
    except Exception as err:
        return jsonify({'error': f'Unexpected server error: {str(err)}'}), 500


@app.route('/api/symptom-checker', methods=['POST'])
def symptom_checker():
    data = request.get_json(silent=True) or {}
    symptoms = (data.get('symptoms') or '').strip()
    age = data.get('age')
    gender = (data.get('gender') or '').strip()
    duration = (data.get('duration') or '').strip()
    severity = (data.get('severity') or '').strip()
    existing_diseases = (data.get('existingDiseases') or '').strip()
    current_medications = (data.get('currentMedications') or '').strip()
    temperature = data.get('temperature')
    api_key = (data.get('apiKey') or GEMINI_API_KEY or '').strip()

    if len(symptoms) < 5:
        return jsonify({'error': 'Please provide more detailed symptoms.'}), 400

    if not api_key:
        return jsonify(fallback_symptom_analysis(symptoms, duration, severity, existing_diseases, current_medications)), 200

    demographic_context = []
    if age not in (None, '', 'null'):
        demographic_context.append(f'Age: {age}')
    if gender:
        demographic_context.append(f'Gender: {gender}')
    if duration:
        demographic_context.append(f'Symptom duration: {duration}')
    if severity:
        demographic_context.append(f'Severity: {severity}')
    if existing_diseases:
        demographic_context.append(f'Existing diseases: {existing_diseases}')
    if current_medications:
        demographic_context.append(f'Current medications: {current_medications}')
    if temperature not in (None, '', 'null'):
        demographic_context.append(f'Reported temperature: {temperature}')

    symptom_prompt = f"Symptoms: {symptoms}"
    if demographic_context:
        symptom_prompt += f"\nPatient context: {', '.join(demographic_context)}"

    system_prompt = (
        'You are a clinical triage assistant for a healthcare app. '
        'Return a single JSON object only, no markdown, no extra text. '
        'Do not provide definitive diagnosis. '
        'Output keys exactly: summary, specialistType, urgency, possibleConditions, recommendations, redFlags, confidence. '
        'urgency must be one of: low, medium, high, emergency. '
        'possibleConditions must have 2-4 concise items. '
        'recommendations must have 4-6 actionable items. '
        'redFlags must have 3-5 warning signs for urgent escalation. '
        'confidence must be one of: low, medium, high. '
        'Keep response practical and specific.'
    )

    payload = {
        'contents': [{'parts': [{'text': symptom_prompt}]}],
        'tools': [{'google_search': {}}],
        'systemInstruction': {'parts': [{'text': system_prompt}]},
        'generationConfig': {
            'temperature': 0.2,
            'maxOutputTokens': 500,
            'responseMimeType': 'application/json'
        }
    }

    endpoint = f"{GEMINI_API_URL}?key={api_key}"
    req = urllib_request.Request(
        endpoint,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )

    try:
        with urllib_request.urlopen(req, timeout=35) as response:
            body = response.read().decode('utf-8')
            parsed = json.loads(body)
            raw_text = extract_gemini_text(parsed)
            structured = parse_json_from_text(raw_text) or {}

            result = {
                'summary': (structured.get('summary') or 'Preliminary symptom triage generated.').strip(),
                'specialistType': (structured.get('specialistType') or 'General Physician').strip(),
                'urgency': (structured.get('urgency') or 'medium').strip().lower(),
                'possibleConditions': structured.get('possibleConditions') if isinstance(structured.get('possibleConditions'), list) else [],
                'recommendations': structured.get('recommendations') if isinstance(structured.get('recommendations'), list) else [],
                'redFlags': structured.get('redFlags') if isinstance(structured.get('redFlags'), list) else [],
                'confidence': (structured.get('confidence') or 'medium').strip().lower(),
                'sources': []
            }

            grounding_chunks = (((parsed.get('candidates') or [{}])[0].get('groundingMetadata') or {}).get('groundingChunks') or [])
            sources = []
            for chunk in grounding_chunks:
                web = chunk.get('web') or {}
                title = (web.get('title') or '').strip()
                url = (web.get('uri') or '').strip()
                if title and url:
                    sources.append({'title': title, 'url': url})
            result['sources'] = sources[:5]

            if result['urgency'] not in ('low', 'medium', 'high', 'emergency'):
                result['urgency'] = 'medium'
            if result['confidence'] not in ('low', 'medium', 'high'):
                result['confidence'] = 'medium'

            if not result['recommendations']:
                result['recommendations'] = fallback_symptom_analysis(symptoms, duration, severity, existing_diseases, current_medications)['recommendations']
            if not result['redFlags']:
                result['redFlags'] = fallback_symptom_analysis(symptoms, duration, severity, existing_diseases, current_medications)['redFlags']
            if not result['possibleConditions']:
                result['possibleConditions'] = fallback_symptom_analysis(symptoms, duration, severity, existing_diseases, current_medications)['possibleConditions']

            return jsonify(result), 200
    except HTTPError as http_err:
        error_body = ''
        upstream_message = ''
        try:
            error_body = http_err.read().decode('utf-8')
            parsed = json.loads(error_body)
            upstream_message = parsed.get('error', {}).get('message', '')
        except Exception:
            pass

        # Graceful fallback for front-end UX.
        fallback = fallback_symptom_analysis(symptoms, duration, severity, existing_diseases, current_medications)
        fallback['summary'] = f"AI service unavailable ({upstream_message or 'upstream error'}). Showing fallback triage."
        return jsonify(fallback), 200
    except URLError:
        fallback = fallback_symptom_analysis(symptoms, duration, severity, existing_diseases, current_medications)
        fallback['summary'] = 'Network issue while contacting AI service. Showing fallback triage.'
        return jsonify(fallback), 200
    except Exception:
        fallback = fallback_symptom_analysis(symptoms, duration, severity, existing_diseases, current_medications)
        fallback['summary'] = 'Unexpected analysis error. Showing fallback triage.'
        return jsonify(fallback), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
