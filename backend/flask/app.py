from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import io
import os
import tempfile
import logging
from werkzeug.utils import secure_filename

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

UPLOAD_FOLDER = '/tmp/coursepilot_uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

logger.debug("Creating Flask app")
app = Flask(__name__)
CORS(app)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Lazy imports
_celery_tasks = None

def get_celery_tasks():
    global _celery_tasks
    if _celery_tasks is None:
        logger.debug("Importing celery tasks")
        try:
            from celery_app import (
                query_documents_task, 
                process_document_task, 
                process_pdf_task,
                get_pdf_task  # Add this import
            )
            _celery_tasks = {
                'query_documents': query_documents_task,
                'process_document': process_document_task,
                'process_pdf': process_pdf_task,
                'get_pdf': get_pdf_task  # Add this task
            }
            logger.debug("Successfully imported celery tasks")
        except Exception as e:
            logger.error(f"Error importing celery tasks: {str(e)}")
            raise
    return _celery_tasks

@app.route('/')
def index():
    return jsonify({'message': 'Hello from Flask!'})

@app.route('/get_documents', methods=['GET'])
def fetch_documents():
    search_string = request.args.get('search')
    
    if not search_string:
        return jsonify({"error": "Missing search parameter"}), 400
    
    celery = get_celery_tasks()
    task = celery['query_documents'].delay(search_string, 4)
    result = task.get()
    
    return jsonify(result), 200

@app.route('/process_text', methods=['POST'])
def process_text():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400

    data = request.get_json()
    
    if not data or not data.get('corpus'):
        return jsonify({"error": "Missing corpus in request"}), 400
    
    celery = get_celery_tasks()
    task = celery['process_document'].delay(data)
    result = task.get()
    
    return jsonify(result), 200

@app.route('/process_pdf', methods=['POST'])
def upload_pdf():
    try:
        logger.info("Received PDF upload request")
        logger.debug(f"Request form data: {request.form}")
        
        if 'file' not in request.files:
            logger.warning("No file in request")
            return jsonify({'error': 'No file provided'}), 400
            
        file = request.files['file']
        if file.filename == '':
            logger.warning("Empty filename")
            return jsonify({'error': 'No file selected'}), 400
            
        if not file.filename.lower().endswith('.pdf'):
            logger.warning(f"Invalid file type: {file.filename}")
            return jsonify({'error': 'File must be a PDF'}), 400
            
        # Get form data with defaults
        form_data = {
            'title': request.form.get('title', 'Untitled'),
            'userId': request.form.get('userId', 'anonymous'),
            'courseId': request.form.get('courseId', 'default')
        }
        logger.debug(f"Processed form data: {form_data}")
        
        # Save and process file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        logger.debug(f"Saved file to: {filepath}")
        
        # Get Celery tasks and start processing
        celery = get_celery_tasks()
        logger.debug(f"Starting Celery task with form_data: {form_data}")
        task = celery['process_pdf'].delay(filepath, form_data)
        result = task.get()
        
        return jsonify(result), 200
        
    except Exception as e:
        logger.error(f"Upload error: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/get_pdf/<pdf_id>', methods=['GET'])
def get_pdf_route(pdf_id):
    try:
        logger.info(f"Received request for PDF {pdf_id}")
        
        celery = get_celery_tasks()
        task = celery['get_pdf'].delay(pdf_id)
        result = task.get()
        
        if result is None or result[0] is None:
            logger.warning(f"PDF {pdf_id} not found")
            return jsonify({'error': 'PDF not found'}), 404
            
        content, filename = result
        
        # Create BytesIO object from content
        pdf_file = io.BytesIO(content)
        
        # Return PDF file as response
        return send_file(
            pdf_file,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename or f'document_{pdf_id}.pdf'
        )
        
    except Exception as e:
        logger.error(f"Error retrieving PDF: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/task/<task_id>', methods=['GET'])
def get_task_status(task_id):
    celery = get_celery_tasks()
    task = celery['process_document'].AsyncResult(task_id)
    response = {
        'state': task.state,
    }
    if task.state == 'FAILURE':
        response['error'] = str(task.info)
    elif task.state == 'SUCCESS':
        response['result'] = task.get()
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
