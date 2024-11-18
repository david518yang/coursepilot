import requests
import json
from pathlib import Path

def test_process_text():
    base_url = "http://157.245.2.33"
    
    # Test data
    test_data = {
        "corpus": """
        Philosophy is the systematic study of fundamental questions about existence, 
        knowledge, values, reason, mind, and language. Such questions are often posed 
        as problems to be studied or resolved. Some sources claim the term was coined 
        by Pythagoras (c. 570 – c. 495 BCE); others dispute this. In any case, 
        philosophical methods include questioning, critical discussion, rational argument, 
        and systematic presentation.
        
        Classic philosophical questions include: Is it possible to know anything and to 
        prove it? What is most real? Do humans have free will? Is there a best way to live? 
        Is it better to be just or unjust?
        """,
        "title": "Introduction to Philosophy",
        "userId": "test123",
        "courseId": "PHIL101"
    }
    
    try:
        print("Testing /process_text endpoint...")
        print(f"\nSending data:\n{json.dumps(test_data, indent=2)}")
        
        response = requests.post(
            f"{base_url}/process_text",
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        # Print response details
        print(f"\nStatus Code: {response.status_code}")
        print("Headers:", json.dumps(dict(response.headers), indent=2))
        
        if response.status_code == 200:
            result = response.json()
            print("\nSuccess! Response:")
            print(json.dumps(result, indent=2))
        else:
            print("\nError Response:")
            print(response.text)
            
    except requests.exceptions.RequestException as e:
        print(f"\nRequest Error: {str(e)}")
    except json.JSONDecodeError as e:
        print(f"\nJSON Decode Error: {str(e)}")
    except Exception as e:
        print(f"\nUnexpected Error: {str(e)}")

def test_pdf_retrieval():
    # Your server URL
    base_url = "http://157.245.2.33"
    
    # Your specific PDF ID
    pdf_id = "673810c32d46d84e498e1d03"
    
    try:
        # Call the get_pdf endpoint
        print(f"Retrieving PDF with ID: {pdf_id}")
        response = requests.get(f"{base_url}/get_pdf/{pdf_id}")
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        print(f"Content Type: {response.headers.get('Content-Type')}")
        
        try:
            # Try to parse as JSON (for error messages)
            print("Response content:", response.text)
        except:
            # If not JSON, print raw content length
            print(f"Response length: {len(response.content)} bytes")
        
        if response.status_code == 200:
            output_path = f"retrieved_document_{pdf_id}.pdf"
            with open(output_path, 'wb') as f:
                f.write(response.content)
            print(f"PDF successfully downloaded to: {output_path}")
        else:
            print(f"Failed to retrieve PDF. Status code: {response.status_code}")
            
    except Exception as e:
        print(f"Error: {str(e)}")
        raise

if __name__ == "__main__":
    test_process_text()