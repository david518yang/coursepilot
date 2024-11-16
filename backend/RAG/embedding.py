from transformers import BertTokenizer, BertModel
import torch
from concurrent.futures import ThreadPoolExecutor
import threading

# Global variables for lazy loading
_model = None
_tokenizer = None
_model_lock = threading.Lock()

def get_tokenizer():
    global _tokenizer
    if _tokenizer is None:
        _tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
    return _tokenizer

def get_model():
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:  # Double-check pattern
                device = torch.device("cpu")  # Force CPU
                _model = BertModel.from_pretrained('bert-base-uncased')
                _model.eval()
                torch.set_grad_enabled(False)  # Disable gradients
    return _model

"""
    Assemble batches of sentences to optimize the number of tokens in each batch.
    Parameters:
        sentences: List[str]
        max_tokens: int
    Returns:
        List[List[str]]: A list of batches, where each batch is a list of sentences.
"""
def assemble_batch(sentences, max_tokens=512):
    current_batch = []
    current_token_count = 0
    batches = []
    tokenized_sentences = [(sentence, len(get_tokenizer().encode(sentence, add_special_tokens=True))) 
                          for sentence in sentences]

    for sentence, token_count in tokenized_sentences:
        if token_count > max_tokens:
            batches.append([sentence])
            continue
        elif current_token_count + token_count <= max_tokens:
            current_batch.append(sentence)
            current_token_count += token_count
        else:
            batches.append(current_batch)
            current_batch = [sentence]
            current_token_count = token_count

    if current_batch:
        batches.append(current_batch)

    return batches

"""
    Embed a batch of sentences.
    Parameters:
        batch: List[str]
    Returns:
        np.ndarray: A numpy array of embeddings.
"""
def embed(batch):
    tokenizer = get_tokenizer()
    model = get_model()
    inputs = tokenizer(batch, return_tensors='pt', truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :].numpy()

def single_embed(sentence):
    tokenizer = get_tokenizer()
    model = get_model()
    inputs = tokenizer(sentence, return_tensors='pt', truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
        embedding = outputs.last_hidden_state[0, 0, :].numpy()
    return embedding

"""
    Get the embeddings for a list of sentences.
    Parameters:
        sentences: List[str]
        max_tokens: int
    Returns:
        List[np.ndarray]: A list of numpy arrays of embeddings.
"""
def get_bert_embeddings(sentences, max_tokens=512):
    batches = assemble_batch(sentences, max_tokens)
    embeddings = []
    with ThreadPoolExecutor(max_workers=4) as executor:
        for batch_embeddings in executor.map(embed, batches):
            embeddings.extend(batch_embeddings)
    return embeddings