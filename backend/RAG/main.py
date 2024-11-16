from .embedding import get_bert_embeddings, single_embed
from .db import insert_document_with_embeddings, retrieve_document_by_vector
from .document_chunker import semantic_chunk_with_gemini, chunk_document_by_sentences
from .parse import parse

"""
    Embed and store the documents in the database.
    Parameters:
        input_data: dict containing 'chunks' and 'metadata'
"""
def embed_and_store_docs(input_data):
    embeddings = get_bert_embeddings(input_data["chunks"])
    metadata = input_data["metadata"]
    
    for i in range(len(input_data["chunks"])):
        document_data = {
            "title": f"{metadata.get('title', 'Untitled')} - {i}",
            "text": input_data["chunks"][i],
            "embedding": embeddings[i],
            "userId": metadata.get('userId', 'anonymous'),
            "courseId": metadata.get('courseId', 'default')
        }
        insert_document_with_embeddings(document_data)
        
    

"""
    Query the database for similar documents.
    Parameters:
        query: str
        num_results: int
"""
def query(query_text, num_results):
    query_vector = single_embed(query_text)
    results = retrieve_document_by_vector(query_vector, num_results)
    
    # Debug print
    print(f"Got {len(results)} results from vector search")
    
    if not results:
        print("No results found")
        return []
        
    for document in results:
        print(document.get("text", "No text found"))
    
    return results

# main()