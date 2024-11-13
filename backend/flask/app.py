from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import tempfile

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'RAG')))
from main import query, embed_and_store_docs
from document_chunker import chunk_document_by_sentences, chunk_document_with_md
from parse import parse
from db import store_pdf

app = Flask(__name__)

CORS(app)

@app.route('/')
def index():
    return jsonify({'message': 'Hello from Flask!'})

@app.route('/documents', methods=['GET'])
def fetch_documents():
    search_string = request.args.get('search')
    
    if not search_string:
        return jsonify({"error": "Missing search parameter"}), 400
    
    relevant_documents = list(query(search_string,4))
    
    return jsonify({"documents": relevant_documents}), 200

@app.route('/documents', methods=["POST"])
def process_text():
    data = request.get_json()

    if data is None:
        return jsonify({"error": "Missing json content"}), 400

    userId = data.get('userId')
    courseId = data.get('courseId')
    title = data.get('title')
    corpus = data.get('corpus')
    if not all([userId, courseId, title, corpus]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        chunks = chunk_document_by_sentences(corpus)

        input_data = {
            "userId": userId,
            "courseId": courseId,
            "title": title,
            "chunks": chunks
        }

        doc_ids = embed_and_store_docs(input_data)
        doc_ids = [str(doc_id) for doc_id in doc_ids]
        if not doc_ids:
            return jsonify({"error": "Failed to store documents"}), 500

        return jsonify({
            "message": "Document successfully chunked, embedded, and stored",
            "documentIds": doc_ids
        }), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/upload_pdf', methods=['POST'])
def upload_pdf():
    if 'pdf' not in request.files:
        return jsonify({"error": "No PDF file provided"}), 400

    pdf_file = request.files['pdf']
    if pdf_file.filename == '':
        return jsonify({"error": "No selected PDF file"}), 400

    try:
        # Parse the PDF file content using the file path of pdf_file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            pdf_file.save(temp_pdf.name)
            parsed_content = parse(temp_pdf.name)
        
        os.remove(temp_pdf.name)

        userId = request.form.get('userId')
        courseId = request.form.get('courseId')
        title = request.form.get('title')

        if not all([userId, courseId, title]):
            return jsonify({"error": "Missing required fields"}), 400

        pdf_input_data = {
            "userId": userId,
            "courseId": courseId,
            "title": title,
        }
        pdf_file.seek(0)
        pdf_id = store_pdf(pdf_file, pdf_input_data)


        chunks = chunk_document_with_md(parsed_content)

        doc_input_data = {
            "userId": userId,
            "courseId": courseId,
            "title": title,
            "chunks": chunks
        }
        doc_ids = embed_and_store_docs(doc_input_data)
        doc_ids = [str(doc_id) for doc_id in doc_ids]

        if not doc_ids:
            return jsonify({"error": "Failed to store documents"}), 500

        return jsonify({
            "message": "PDF successfully uploaded, parsed, embedded, and stored",
            "pdf_file_id": pdf_id,
            "documentIds": doc_ids
        }), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
