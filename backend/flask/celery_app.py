from celery import Celery
import os
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

current_dir = os.path.dirname(os.path.abspath(__file__))  # /backend/flask
parent_dir = os.path.dirname(current_dir)                 # /backend
sys.path.append(parent_dir)

# Initialize Celery
logger.debug("Initializing Celery")
try:
    celery = Celery('coursepilot',
                    broker='redis://localhost:6379/0',
                    backend='redis://localhost:6379/0')

    celery.conf.update(
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True,
    )
    logger.debug("Successfully initialized Celery")
except Exception as e:
    logger.error(f"Error initializing Celery: {str(e)}")
    raise

# Lazy imports for RAG modules
_rag_modules = None

def get_rag_modules():
    global _rag_modules
    if _rag_modules is None:
        logger.debug("Importing RAG modules")
        try:
            from RAG.main import query, embed_and_store_docs
            from RAG.document_chunker import chunk_document_by_sentences, semantic_chunk_with_gemini
            from RAG.parse import parse
            from RAG.db import store_pdf, get_pdf
            _rag_modules = {
                'query': query,
                'embed_and_store_docs': embed_and_store_docs,
                'chunk_document_by_sentences': chunk_document_by_sentences,
                'semantic_chunk_with_gemini': semantic_chunk_with_gemini,
                'parse': parse,
                'store_pdf': store_pdf,
                'get_pdf': get_pdf
            }
            logger.debug("Successfully imported RAG modules")
        except Exception as e:
            logger.error(f"Error importing RAG modules: {str(e)}")
            raise
    return _rag_modules

@celery.task(name='query_documents')
def query_documents_task(search_string, num_results=0):
    try:
        rag = get_rag_modules()
        relevant_documents = list(rag['query'](search_string, num_results))
        return [
            {
                'text': doc.get('text', ''),
                'title': doc.get('title', ''),
                'userId': doc.get('userId', '')
            }
            for doc in relevant_documents
        ]
    except Exception as e:
        print(f"Error querying documents: {str(e)}")
        return []

@celery.task(name='process_document')
def process_document_task(data):
    try:
        logger.info("Processing document")
        logger.debug(f"Input data: {data}")
        
        # Extract required fields
        corpus = data.get('corpus')
        title = data.get('title', 'Untitled')
        user_id = data.get('userId', 'anonymous')
        course_id = data.get('courseId', 'default')
        
        if not corpus:
            raise ValueError("Missing corpus in input data")
            
        # Get RAG modules
        rag = get_rag_modules()
        
        # Process the document
        chunks = rag['chunk_document_by_sentences'](corpus)
        logger.debug(f"Created {len(chunks)} chunks")
        
        # Format data for embed_and_store_docs
        chunk_data = {
            'chunks': chunks,
            'metadata': {
                'title': title,
                'userId': user_id,
                'courseId': course_id
            }
        }
        
        # Process all chunks at once
        rag['embed_and_store_docs'](chunk_data)
        
        return {
            'status': 'success',
            'message': f'Document processed successfully. Created {len(chunks)} chunks.',
            'chunks_count': len(chunks)
        }
        
    except Exception as e:
        logger.error(f"Error processing document: {str(e)}", exc_info=True)
        return {
            'status': 'error',
            'message': str(e)
        }

@celery.task(name='process_pdf')
def process_pdf_task(pdf_path, form_data):
    try:
        logger.info(f"Starting PDF processing")
        logger.debug(f"Received form_data: {form_data}")
        
        metadata = {
            'title': form_data.get('title', 'Untitled'),
            'userId': form_data.get('userId', 'anonymous'),
            'courseId': form_data.get('courseId', 'default')
        }
        logger.debug(f"Processed metadata: {metadata}") 
        
        rag = get_rag_modules()
        logger.debug("Got RAG modules")
        
        with open(pdf_path, 'rb') as pdf_file:
            # Pass metadata instead of raw form_data
            pdf_id = rag['store_pdf'](pdf_file, metadata)
            logger.debug(f"PDF stored with ID: {pdf_id}")
        
        corpus = rag['parse'](pdf_path)
        chunks = rag['semantic_chunk_with_gemini'](corpus)
        
        chunk_data = {
            'chunks': chunks,
            'metadata': metadata
        }
        
        rag['embed_and_store_docs'](chunk_data)
        
        return {
            "status": "success", 
            "message": "PDF processed successfully",
            "pdf_id": pdf_id
        }
        
    except Exception as e:
        logger.error(f"Error processing PDF: {str(e)}", exc_info=True)  # Added exc_info for full traceback
        raise
        
    finally:
        try:
            if os.path.exists(pdf_path):
                os.remove(pdf_path)
        except Exception as cleanup_error:
            logger.error(f"Error cleaning up temp file: {str(cleanup_error)}")

@celery.task(name='get_pdf')
def get_pdf_task(pdf_id):
    try:
        logger.info(f"Getting PDF {pdf_id}")
        rag = get_rag_modules()
        
        content, filename = rag['get_pdf'](pdf_id)
        if content is None:
            logger.warning(f"PDF {pdf_id} not found")
            return None
            
        return content, filename
        
    except Exception as e:
        logger.error(f"Error getting PDF: {str(e)}", exc_info=True)
        raise