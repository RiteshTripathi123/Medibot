from flask import Flask, request, jsonify, render_template

# --- 1. INITIALIZE FLASK APPLICATION ---
app = Flask(__name__, static_folder='static', template_folder='templates')

# Simple in-memory list to simulate a database for appointments
APPOINTMENTS_DB = []
appointment_counter = 1

# --- 2. DEFINE ROUTES (API Endpoints) ---

@app.route('/')
def index():
    """
    Renders the main HTML page (portal.html).
    NOTE: For this to work, your portal.html must be in a folder named 'templates'
    next to this server.py file.
    """
    try:
        # Assumes portal.html is in the 'templates' folder
        return render_template('portal.html')
    except Exception:
        # If running the HTML directly, this is a fallback.
        return "<h1>Medibot Backend Running</h1><p>Please open portal.html in your browser or place it in a 'templates' folder to run via Flask.</p>"


@app.route('/api/appointments/book', methods=['POST'])
def book_appointment():
    """
    Handles the POST request from the appointment form in portal.html.
    It simulates receiving and storing the appointment data.
    """
    global appointment_counter

    # 2.1. Get data from the submitted form (portal.html form fields)
    try:
        data = request.form
        
        # Extract fields based on IDs in your HTML form
        patient_name = data.get('patientName')
        patient_email = data.get('patientEmail')
        doctor = data.get('doctorSelect')
        date = data.get('appointmentDate')
        time = data.get('appointmentTime')

        # 2.2. Basic Validation (In a real app, this would be much more robust)
        if not all([patient_name, patient_email, doctor, date, time]):
            return jsonify({
                "status": "error",
                "message": "Missing required appointment fields."
            }), 400

        # 2.3. Create the appointment object
        new_appointment = {
            "id": appointment_counter,
            "patientName": patient_name,
            "patientEmail": patient_email,
            "doctor": doctor,
            "date": date,
            "time": time,
            "status": "Confirmed",
            "booked_at": request.date
        }
        
        # 2.4. Simulate saving to a database
        APPOINTMENTS_DB.append(new_appointment)
        appointment_counter += 1

        # 2.5. Send a successful response
        print(f"✅ New Appointment Booked: {new_appointment}")
        return jsonify({
            "status": "success",
            "message": "Appointment booked successfully!",
            "appointment": new_appointment
        }), 201

    except Exception as e:
        print(f"❌ Error during appointment booking: {e}")
        return jsonify({
            "status": "error",
            "message": "An internal server error occurred during booking."
        }), 500

@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    """
    API to fetch all stored appointments.
    """
    return jsonify({
        "status": "success",
        "appointments": APPOINTMENTS_DB
    })


# --- 3. RUN THE SERVER ---

if __name__ == '__main__':
    print("-----------------------------------------------------")
    print("🚀 Flask Appointment Server Started")
    print("🌐 Running on http://127.0.0.1:5000/")
    print("-----------------------------------------------------")
    # Set debug=True for automatic reloading during development
    app.run(debug=True)
