import nest_asyncio
nest_asyncio.apply()
from llama_parse import LlamaParse
from dotenv import load_dotenv
import os

load_dotenv()
llamaindex_api_key = os.getenv("LLAMAINDEX_API_KEY")

def parse(file_path):
    parser = LlamaParse(
        api_key=llamaindex_api_key,
        result_type="markdown",
        verbose=True
    )

    documents = parser.load_data(file_path)

    output_text = ""
    for document in documents:
        output_text += f"{document.text}\n"
        
    return output_text