from embedding import get_bert_embedding
from db import insert_document_with_embeddings, retrieve_document_by_vector
from document_chunker import chunk_document_with_md, chunk_document_by_sentences
from parse import parse
from bson import json_util
import json

def main():
    document_title = "test"
    # corpus = "Artificial intelligence is transforming the technology industry through innovative solutions. Regular exercise contributes significantly to overall health and wellness. Environmental conservation efforts aim to protect wildlife and natural habitats. Financial markets react to economic indicators and global events. Historical artifacts provide insight into ancient cultures and traditions. Machine learning algorithms enable artificial intelligence systems to learn from data. Nutritionists recommend balanced diets for optimal health and energy. Climate change impacts the strategies used in environmental conservation. Economists study financial trends to forecast economic growth. Cultural heritage is preserved through the study of history. Technology companies invest in artificial intelligence research to stay ahead. Mental health awareness is essential for community wellness initiatives. Sustainable practices are vital for long-term environmental conservation. Investment strategies are influenced by the current economic climate. Historians analyze events to understand cultural developments. Deep learning, a subset of machine learning, advances the capabilities of artificial intelligence. Wellness programs often include stress management and physical health components. Conservationists promote renewable energy to reduce environmental impact. Economic policies can stimulate or hinder financial development. The history of art reflects the cultural values of societies. The integration of artificial intelligence in technology enhances automation and efficiency. Health professionals advocate for preventive care to maintain wellness. Pollution control is a key aspect of environmental conservation policies. Understanding finance is crucial for making informed economic decisions. Cultural festivals celebrate the rich history of communities"
    corpus = parse("biology_lecture.pdf")
    chunks = chunk_document_with_md(corpus)
    for chunk in chunks:
        print(chunk)
        print('=================================================================')

def embed_and_store_docs(document_title, chunks):
    embeddings = [get_bert_embedding(chunk) for chunk in chunks]
    for i in range(len(chunks)):
        input_data = {
            "title": f"{document_title} - {i}",
            "text": chunks[i],
            "embedding": embeddings[i]
        }
        insert_document_with_embeddings(input_data)  

def query(query, num_results):
    query_vector = get_bert_embedding(query)
    results = retrieve_document_by_vector(query_vector, num_results)
    return json.loads(json_util.dumps(results))
