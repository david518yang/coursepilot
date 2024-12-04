import pymongo
import gridfs
import numpy
from dotenv import load_dotenv
from bson.objectid import ObjectId
import os
import threading

# Global variables for lazy loading
_client = None
_client_lock = threading.Lock()

def get_client():
    global _client
    if _client is None:
        with _client_lock:
            if _client is None:  # Double-check pattern
                load_dotenv()
                uri = os.getenv("MONGODB_URI")
                _client = pymongo.MongoClient(uri)
    return _client

def insert_document_with_embeddings(input_data):
    client = get_client()
    db = client.Documents_and_Embeddings
    collection = db.documents
    embedding = input_data["embedding"].tolist() if isinstance(input_data["embedding"], numpy.ndarray) else input_data 

    document = {
        "userId": input_data["userId"],
        "courseId": input_data["courseId"],
        "title": input_data["title"],
        "text": input_data["text"],
        "embedding": embedding,
        "userId": input_data["userId"],
        "courseId": input_data["courseId"]
    }
    try:
        result = collection.insert_one(document)
        print(f"Document inserted with id: {result.inserted_id}")
        return result.inserted_id
    except Exception as e:
        print(f"An error occurred while inserting the document: {e}")
        return None

def store_pdf(pdf, input_data):
    """
    Store a PDF file in MongoDB with metadata.
    
    Args:
        pdf: The PDF file object
        input_data: Dictionary containing metadata (title, userId, courseId)
    
    Returns:
        str: The ID of the stored PDF
    """
    client = get_client()
    db = client.Courses
    fs = gridfs.GridFS(db, collection="pdfs")
    
    filename = input_data.get('title', 'Untitled')
    
    pdf_id = fs.put(pdf, 
                    filename=filename, 
                    metadata=input_data)
    
    return str(pdf_id)

def get_pdf(pdf_id):
    """
    Retrieve a PDF file from MongoDB.
    
    Args:
        pdf_id: String or ObjectId of the PDF to retrieve
    
    Returns:
        Tuple of (binary_content, filename) or (None, None) if not found
    """
    client = get_client()
    db = client.Courses
    
    try:
        # Convert string ID to ObjectId if needed
        if isinstance(pdf_id, str):
            pdf_id = ObjectId(pdf_id)
            
        # Get the file directly from the collections
        files = db['pdfs.files']
        chunks = db['pdfs.chunks']
        
        # Find the file metadata
        file_doc = files.find_one({'_id': pdf_id})
        if not file_doc:
            print(f"PDF {pdf_id} not found")
            return None, None
            
        # Get all chunks
        chunks_data = chunks.find({'files_id': pdf_id}).sort('n', 1)
        if not chunks_data:
            print(f"No chunks found for PDF {pdf_id}")
            return None, None
            
        # Combine chunks into one binary string
        content = b''.join(chunk['data'] for chunk in chunks_data)
        
        # Return both content and filename
        return content, file_doc.get('filename', 'document.pdf')
        
    except Exception as e:
        print(f"Error retrieving PDF: {str(e)}")
        return None, None


def retrieve_document_by_vector(query_vector, num_results):
    client = get_client()
    db = client.Documents_and_Embeddings
    collection = db.documents
    
    # Debug print
    print(f"Query vector type: {type(query_vector)}, shape/len: {getattr(query_vector, 'shape', len(query_vector))}")
    
    # Convert numpy array to list
    if hasattr(query_vector, 'tolist'):
        query_vector = query_vector.tolist()
    
    # If we got a nested list/array, flatten it
    if isinstance(query_vector, list) and len(query_vector) == 1 and isinstance(query_vector[0], (list, numpy.ndarray)):
        query_vector = query_vector[0]
    
    # Ensure all values are float
    query_vector = [float(x) for x in query_vector]
    
    pipeline = [
        {
            "$vectorSearch": {
                "queryVector": query_vector,
                "path": "embedding",
                "numCandidates": 100,
                "limit": num_results or 5,
                "index": "vector_index"
            }
        },
        {
            "$project": {
                "text": 1,
                "title": 1,
                "userId": 1,
                "score": { "$meta": "vectorSearchScore" }
            }
        }
    ]
    
    try:
        results = list(collection.aggregate(pipeline))
        print(f"Found {len(results)} results")
        return results or []  # Return empty list if no results
    except Exception as e:
        print(f"Vector search error: {str(e)}")
        return []  # Return empty list on error
