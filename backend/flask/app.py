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
