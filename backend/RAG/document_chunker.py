import nltk
from nltk.tokenize import sent_tokenize
from transformers import BertTokenizer
import re

# nltk.download('punkt')
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
def chunk_document_by_sentences(text):
    sentences = sent_tokenize(text)

    tokenized_sentences = [nltk.word_tokenize(sent) for sent in sentences]

    return sentences


def chunk_document_with_md(markdown_content):
    heading_pattern = re.compile(r'^(#{1,6})\s*(.*)', re.MULTILINE)
    
    headings = [(match.start(), match.group(1), match.group(2))
                for match in heading_pattern.finditer(markdown_content)]
    
    chunks = []
    num_headings = len(headings)
    
    for i in range(num_headings):
        # Start position of the current heading
        start = headings[i][0]
        
        # End position is the start of the next heading or the end of the document
        end = headings[i+1][0] if i+1 < num_headings else len(markdown_content)
        
        # Extract the chunk
        chunk = markdown_content[start:end].strip()
        chunk += f"\n CHUNK LENGTH: {len(tokenizer.encode(chunk,add_special_tokens=True))}"
        chunks.append(chunk)
    
    return chunks
