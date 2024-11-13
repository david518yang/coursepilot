from transformers import BertTokenizer, BertModel
import torch
from concurrent.futures import ProcessPoolExecutor

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')
model.eval()

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
    tokenized_sentences = [(sentence, len(tokenizer.encode(sentence, add_special_tokens=True))) 
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
    inputs = tokenizer(batch, return_tensors='pt', truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
        batch_embeddings = outputs.last_hidden_state.mean(dim=1).numpy()
    return batch_embeddings

def single_embed(sentence):
    inputs = tokenizer(sentence, return_tensors='pt', truncation=True, padding=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
        embedding = outputs.last_hidden_state.mean(dim=1).numpy()
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
    with ProcessPoolExecutor() as executor:
        for batch_embeddings in executor.map(embed, batches):
            embeddings.extend(batch_embeddings)
    return embeddings