from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# Patient table
class Patient(db.Model):
    __tablename__ = 'patient'  # Add explicit table name

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20))
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    registered_on = db.Column(db.DateTime, default=datetime.utcnow)

    # Add relationship
    appointments = db.relationship('Appointment', backref='patient', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Patient {self.id} {self.email}>"

# Appointment table
class Appointment(db.Model):
    __tablename__ = 'appointment'  # Add explicit table name

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
    doctor_name = db.Column(db.String(100), nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    symptoms = db.Column(db.String(500))
    status = db.Column(db.String(50), default='Scheduled')

    def __repr__(self):
        return f"<Appointment {self.id} for patient {self.patient_id}>"
