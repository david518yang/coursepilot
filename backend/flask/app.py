from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'RAG')))
from main import query, embed_and_store_docs
from document_chunker import chunk_document_by_sentences

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

        input_data = jsonify({
            "userId": userId,
            "courseId": courseId,
            "title": title,
            "chunks": chunks
        })

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

if __name__ == '__main__':
    app.run(debug=True)
