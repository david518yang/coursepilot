from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'RAG')))
from main import query

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
    
    # Call your similarity search function
    relevant_documents = list(query(search_string,4))
    
    # Return the results as JSON
    return jsonify({"documents": relevant_documents}), 200

if __name__ == '__main__':
    app.run(debug=True)

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

    if not data or 'corpus' not in data:
        return jsonify({"error": "Missing corpus in request body"}), 400

    userId = data['userId']
    courseId = data['courseId']
    title = data['title']
    corpus = data['corpus']

    chunks = chunk_document_by_sentences(corpus)
    doc_ids = embed_and_store_docs(userId, courseId, title, chunks)

    return jsonify({
        "message": "Document successfully chunked, embedded and stored",
        "documentIds": doc_ids
    }), 200

if __name__ == '__main__':
    app.run(debug=True)
