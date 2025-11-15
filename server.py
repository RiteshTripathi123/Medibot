from flask import Flask, render_template, request, jsonify, send_from_directory
import os

app = Flask(__name__)

# Route for the homepage (portal)
@app.route('/')
def home():
    return render_template('portal.html')

# Route for appointments page
@app.route('/appointments')
def appointments():
    return render_template('appointments/index.html')

# Example upload route (for upload.js)
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    filename = file.filename
    upload_folder = os.path.join(app.root_path, 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    file.save(os.path.join(upload_folder, filename))
    return jsonify({'message': f'{filename} uploaded successfully!'})

# Serve static files
@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True)
