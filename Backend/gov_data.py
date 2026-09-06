import os
import requests
from dotenv import load_dotenv

_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")

def test_gov_data_api():
    """
    Safely tests the connection to the data.gov.in API using DATA_GOV_API_KEY.
    Requests a small number of records (limit=5) from Maharashtra.
    NEVER logs or returns the API key.
    """
    if os.path.exists(_ENV_PATH):
        load_dotenv(dotenv_path=_ENV_PATH, override=True)
        
    api_key = os.environ.get("DATA_GOV_API_KEY")
    
    if not api_key:
        return {
            "success": False,
            "status": "unconfigured",
            "message": "DATA_GOV_API_KEY is missing in Backend/.env"
        }
        
    # The official data.gov.in resource ID provided by the user
    url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    
    params = {
        "api-key": api_key,
        "format": "json",
        "limit": 5,
        "filters[state]": "Maharashtra"
    }
    
    try:
        response = requests.get(url, params=params, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            records = data.get("records", [])
            
            # Extract a safe summary of the first record (just the values/keys) if available
            sample_summary = {}
            if records:
                sample_summary = {
                    "market": records[0].get("market"),
                    "commodity": records[0].get("commodity"),
                    "modal_price": records[0].get("modal_price")
                }
                
            return {
                "success": True,
                "status": "healthy",
                "records_received": len(records),
                "total_available_in_dataset": data.get("total", "unknown"),
                "sample_fields_available": list(records[0].keys()) if records else [],
                "sample_record_summary": sample_summary,
                "message": "Successfully connected to data.gov.in API."
            }
        else:
            return {
                "success": False,
                "status": "error",
                "http_status_code": response.status_code,
                "message": f"data.gov.in API returned an error status: {response.status_code}"
            }
            
    except requests.exceptions.Timeout:
        return {
            "success": False,
            "status": "error",
            "message": "Connection to data.gov.in API timed out."
        }
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "status": "error",
            "exception_class": e.__class__.__name__,
            "message": "Failed to connect to data.gov.in API."
        }
