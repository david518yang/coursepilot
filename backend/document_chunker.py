import nltk
from nltk.tokenize import sent_tokenize

# nltk.download('punkt')

def chunk_document(text):
    sentences = sent_tokenize(text)

    tokenized_sentences = [nltk.word_tokenize(sent) for sent in sentences]

    return sentences
