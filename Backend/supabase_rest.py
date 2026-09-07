import os
import requests
from dotenv import load_dotenv

# Load environment variables
_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")

def test_supabase_rest_connection():
    """
    Tests the connection to Supabase via its HTTPS REST API.
    Loads SUPABASE_URL and SUPABASE_SECRET_KEY from .env.
    Queries the 'markets' table with limit=1 to verify access.
    
    Returns a safe dictionary with the diagnostic result.
    NEVER logs or returns the secret key or full connection details.
    """
    if os.path.exists(_ENV_PATH):
        load_dotenv(dotenv_path=_ENV_PATH, override=True)
        
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SECRET_KEY")
    
    if not supabase_url or not supabase_key:
        return {
            "success": False,
            "status": "unconfigured",
            "message": "SUPABASE_URL or SUPABASE_SECRET_KEY is missing in Backend/.env"
        }
        
    # Ensure URL doesn't have trailing slash
    supabase_url = supabase_url.rstrip("/")
    
    # Construct the REST API endpoint for the 'markets' table
    endpoint = f"{supabase_url}/rest/v1/markets?select=*&limit=1"
    
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}"
    }
    
    try:
        response = requests.get(endpoint, headers=headers, timeout=10)
        
        if response.status_code == 200:
            return {
                "success": True,
                "status": "healthy",
                "supabase": "connected",
                "table_access": True,
                "message": "Successfully connected to Supabase REST API."
            }
        else:
            # Safe error reporting: do not include the raw response text if it could leak secrets,
            # though Supabase REST errors typically just contain message, hint, code.
            # We'll just return the status code and a generic message to be completely safe.
            return {
                "success": False,
                "status": "error",
                "supabase": "connected",
                "table_access": False,
                "http_status_code": response.status_code,
                "message": f"REST API returned an error status: {response.status_code}"
            }
            
    except requests.exceptions.Timeout:
        return {
            "success": False,
            "status": "error",
            "supabase": "timeout",
            "message": "Connection to Supabase REST API timed out."
        }
    except requests.exceptions.RequestException as e:
        # Extract just the exception class name for safety
        exc_class = e.__class__.__name__
        return {
            "success": False,
            "status": "error",
            "supabase": "connection_failed",
            "exception_class": exc_class,
            "message": "Failed to connect to Supabase REST API over HTTPS."
        }
