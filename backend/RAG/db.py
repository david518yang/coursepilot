import pymongo
import numpy
from dotenv import load_dotenv
import os

load_dotenv()
uri = os.getenv("MONGODB_URI")
client = pymongo.MongoClient(uri)
db = client.Documents_and_Embeddings
collection = db.documents

def insert_document_with_embeddings(input_data):
    embedding = input_data["embedding"].tolist() if isinstance(input_data["embedding"], numpy.ndarray) else input_data 

    document = {
        "title": input_data["title"],
        "text": input_data["text"],
        "embedding": embedding
    }
    try:
        result = collection.insert_one(document)
        print(f"Document inserted with id: {result.inserted_id}")
        return result.inserted_id
    except Exception as e:
        print(f"An error occurred while inserting the document: {e}")
        return None


def retrieve_document_by_vector(query_vector, num_results):
    query = {"$vectorSearch": {
        "queryVector": query_vector.tolist(),
        "path": "embedding",
        "numCandidates": 100,
        "limit": num_results,
        "index": "vector_index"
    }}
    results = collection.aggregate([query])
    return results

