import csv
import json
import os
import re
from collections import defaultdict

"""
Kaggle-related code has been commented out as per user request.
# import kagglehub
"""


DATASET_SLUG = "shashankshukla123123/doctor-fee-predictionpracto"
OUTPUT_PATH = os.path.join("instance", "doctors_india_cities_best.json")
MAX_PER_CITY = 40


def normalize_text(value):
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value).strip())


def parse_percent(value):
    text = normalize_text(value).replace("%", "")
    try:
        return float(text)
    except Exception:
        return 0.0


def parse_patients(value):
    text = normalize_text(value).lower()
    match = re.search(r"(\d+)", text)
    if not match:
        return 0
    try:
        return int(match.group(1))
    except Exception:
        return 0


def parse_experience_years(value):
    text = normalize_text(value)
    try:
        return float(text)
    except Exception:
        match = re.search(r"(\d+(?:\.\d+)?)", text)
        if not match:
            return 0.0
        try:
            return float(match.group(1))
        except Exception:
            return 0.0


def parse_fee(value):
    text = normalize_text(value)
    digits = re.sub(r"[^0-9.]", "", text)
    if not digits:
        return 0.0
    try:
        return float(digits)
    except Exception:
        return 0.0


def find_first_csv(download_dir):
    csv_files = []
    for root, _, files in os.walk(download_dir):
        for name in files:
            if name.lower().endswith(".csv"):
                csv_files.append(os.path.join(root, name))
    if not csv_files:
        return None

    csv_files.sort(key=lambda path: ("docter" in os.path.basename(path).lower(), "doctor" in os.path.basename(path).lower()), reverse=True)
    return csv_files[0]


def score_row(row):
    dp_score = parse_percent(row.get("DP Score"))
    patients = parse_patients(row.get("NPV Value"))
    experience = parse_experience_years(row.get("Years of Experience"))
    fee = parse_fee(row.get("Consult Fee"))

    # Higher DP score, higher reviewed patient count, and higher experience are positive.
    # Lower fee slightly improves ranking to prioritize affordability when quality is close.
    return (dp_score * 1.8) + (patients * 0.15) + (experience * 0.7) - (fee * 0.002)


def build_record(row):
    name = normalize_text(row.get("Name"))
    city = normalize_text(row.get("City")).title()
    locality = normalize_text(row.get("Location")).title()
    specialty = normalize_text(row.get("Speciality"))
    fee = normalize_text(row.get("Consult Fee"))
    degree = normalize_text(row.get("Degree"))
    dp_score = normalize_text(row.get("DP Score"))
    npv = normalize_text(row.get("NPV Value"))

    if not name:
        return None

    if not name.lower().startswith("dr"):
        name = f"Dr. {name}"

    address_parts = [part for part in [locality, city, "India"] if part]
    address = ", ".join(address_parts) if address_parts else "India"

    rating_parts = [part for part in [dp_score, npv] if part]
    if rating_parts:
        rating = " | ".join(rating_parts)
    else:
        # rating = "Kaggle Ranked"

    phone = "N/A"

    return {
        "Name": name,
        "Address": address,
        "Rating": rating,
        "Phone": phone,
        "specialty": specialty if specialty else "General Physician",
        "city": city,
        "state": "",
        "postal_code": "",
        "country": "India",
        "degree": degree,
        "consultation_fee": fee,
    }


def main():
    # download_dir = kagglehub.dataset_download(DATASET_SLUG)
    csv_path = find_first_csv(download_dir)
    if not csv_path:
        # raise RuntimeError("No CSV file found in Kaggle dataset.")

    by_city = defaultdict(list)
    with open(csv_path, "r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        for row in reader:
            city = normalize_text(row.get("City")).title()
            if not city:
                continue

            record = build_record(row)
            if not record:
                continue

            rank_score = score_row(row)
            by_city[city].append((rank_score, record))

    output = []
    for city, rows in by_city.items():
        rows.sort(key=lambda item: item[0], reverse=True)
        unique = set()
        kept = 0
        for _, record in rows:
            key = (record.get("Name", "").lower(), record.get("specialty", "").lower(), record.get("Address", "").lower())
            if key in unique:
                continue
            unique.add(key)
            output.append(record)
            kept += 1
            if kept >= MAX_PER_CITY:
                break

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as out_file:
        json.dump(output, out_file, ensure_ascii=False, indent=2)

    city_count = len(by_city)
    print(f"Created {OUTPUT_PATH}")
    print(f"Cities covered: {city_count}")
    print(f"Doctors saved: {len(output)}")


if __name__ == "__main__":
    main()
