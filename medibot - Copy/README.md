# Medibot Portal

A Flask + JavaScript healthcare portal with authentication, appointments, doctor discovery, pharmacy, emergency tools, and health tracking.

## Run locally

1. Create/activate venv
2. Install dependencies:
   `pip install -r requirements.txt`
3. Start server:
   `python server.py`
4. Open:
   `http://127.0.0.1:5000`

## Key backend routes

- `POST /register`
- `POST /login`
- `POST /logout`
- `GET /api/me`
- `GET /api/appointments`
- `POST /api/appointments`
- `PUT /api/appointments/<id>`
- `DELETE /api/appointments/<id>`

## Notes

- SQLite database file is created under `instance/`.
- Session auth is required for appointment APIs.
- Doctor search now uses Kaggle dataset records from `instance/doctors_kaggle.json` (auto-download fallback via `kagglehub` if missing).
- `POST /api/doctors` first searches Kaggle data by specialty + location; if no match, it can fall back to Gemini when API key is available.
