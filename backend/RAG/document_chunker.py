import nltk
from nltk.tokenize import sent_tokenize
from transformers import BertTokenizer
import google.generativeai as genai
import re
import os
# nltk.download('punkt')

"""
    Chunk a document by sentences.
    Parameters:
        text: str
    Returns:
        List[str]: A list of sentences.
"""
def chunk_document_by_sentences(text):
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
    sentences = sent_tokenize(text)
    tokenized_sentences = [nltk.word_tokenize(sent) for sent in sentences]
    return sentences

"""
    Segments a Markdown-formatted document into semantically coherent chunks using the Gemini 1.5 Flash API.

    Parameters:
        markdown_content (str): The input Markdown content to be chunked.
        model_name (str): The Gemini model to use. Default is "gemini-1.5-flash".
        max_chunk_size (int): The maximum number of tokens per chunk. Default is 1000.

    Returns:
        List of strings, each representing a semantically coherent chunk.
"""
def semantic_chunk_with_gemini(markdown_content, model_name="gemini-1.5-flash", max_chunk_size=250):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel(model_name=model_name)
    
    prompt = (f'''You are an expert in reviewing text and grouping concepts of text into semantically coherent sections. 
        Each section should represent a distinct topic or idea and should be a concatenation of sentences FROM THE TEXT that are related to the same topic. These should not exceed {max_chunk_size} tokens. 
        For every section, only include the sentences that provide the most information and are the most relevant to the topic.
        Return only the segmented sections as a list of strings. 
        Document:\n{markdown_content}\n\n''')

    response = model.generate_content(prompt)
    response_text = response.text.strip()

    sections = response_text.split("\n\n")

    sections = [section for section in sections if section.strip()]

    return sections
