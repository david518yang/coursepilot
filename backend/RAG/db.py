import pymongo
import gridfs
import numpy
from dotenv import load_dotenv
from bson.objectid import ObjectId
import os

load_dotenv()
uri = os.getenv("MONGODB_URI")
client = pymongo.MongoClient(uri)

def insert_document_with_embeddings(input_data):
    db = client.Documents_and_Embeddings
    collection = db.documents
    embedding = input_data["embedding"].tolist() if isinstance(input_data["embedding"], numpy.ndarray) else input_data 

    document = {
        "title": input_data["title"],
        "text": input_data["text"],
        "embedding": embedding,
        "userId": input_data["userId"]
    }
    try:
        result = collection.insert_one(document)
        print(f"Document inserted with id: {result.inserted_id}")
        return result.inserted_id
    except Exception as e:
        print(f"An error occurred while inserting the document: {e}")
        return None

def store_pdf(pdf, input_data):
    db = client.Courses
    collection = db.pdfs
    fs = gridfs.GridFS(db)
    pdf_id = fs.put(pdf, filename = input_data["title"], metadata=input_data)
    return str(pdf_id)

def retrieve_document_by_vector(query_vector, num_results):
    db = client.Documents_and_Embeddings
    collection = db.documents
    query = {"$vectorSearch": {
        "queryVector": query_vector.tolist(),
        "path": "embedding",
        "numCandidates": 100,
        "limit": num_results,
        "index": "vector_index"
    }}
    results = collection.aggregate([query])
    return results

