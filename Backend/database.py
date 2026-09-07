import os
from pathlib import Path
from contextlib import contextmanager
from typing import Dict, Any, Optional
from urllib.parse import urlparse
from dotenv import load_dotenv
import psycopg2

# Path to Backend/.env
_ENV_PATH = Path(__file__).resolve().parent / ".env"


def get_database_url() -> Optional[str]:
    """
    Safely retrieves the DATABASE_URL environment variable.
    Always reloads from Backend/.env to pick up any changes.
    Returns None if missing or if still set to the default placeholder.
    """
    if _ENV_PATH.exists():
        load_dotenv(dotenv_path=_ENV_PATH, override=True)

    url = os.getenv("DATABASE_URL")
    if not url:
        return None
    
    clean_url = url.strip().strip('"').strip("'")
    if not clean_url or clean_url == "PASTE_DATABASE_CONNECTION_STRING_HERE":
        return None

    return clean_url


def categorize_db_error(exc: Exception) -> str:
    """
    Categorizes database exceptions into safe diagnostic categories
    without exposing any passwords or connection strings.
    """
    msg = str(exc).lower()

    if "password authentication failed" in msg or "authentication failed" in msg:
        return "authentication_failed"
    elif "ssl" in msg or "certificate" in msg or "tls" in msg or "encryption" in msg:
        return "ssl_error"
    elif "connection refused" in msg or "10061" in msg:
        return "connection_refused"
    elif "timeout" in msg or "timed out" in msg:
        return "timeout"
    elif "server closed the connection" in msg or "connection reset" in msg:
        return "server_closed_connection"
    elif "invalid" in msg or "could not parse" in msg or "dsn" in msg or "port" in msg:
        return "invalid_database_url"
    else:
        return "connection_failed"


@contextmanager
def get_db_connection():
    """
    Context manager providing a safe psycopg2 database connection.
    Explicitly enforces SSL mode 'require' and connection timeout.
    """
    db_url = get_database_url()
    if not db_url:
        raise ValueError("missing_database_url")

    # Basic scheme validation
    parsed = urlparse(db_url)
    if parsed.scheme not in ("postgresql", "postgres"):
        raise ValueError("invalid_database_url")

    conn = None
    try:
        conn = psycopg2.connect(
            db_url,
            sslmode="require",
            gssencmode="disable",
            connect_timeout=10
        )
        yield conn
    finally:
        if conn is not None and not conn.closed:
            conn.close()


def test_db_connection() -> Dict[str, Any]:
    """
    Tests database connectivity with 'SELECT 1;'.
    Returns a safe diagnostic category without exposing sensitive info.
    """
    db_url = get_database_url()
    if not db_url:
        return {
            "success": False,
            "status": "unconfigured",
            "diagnostic": "missing_database_url",
            "message": "DATABASE_URL is missing or set to placeholder in Backend/.env."
        }

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1;")
                cur.fetchone()
        return {
            "success": True,
            "status": "connected",
            "diagnostic": "database_connected",
            "message": "Database connection successful."
        }
    except ValueError as ve:
        diag = str(ve)
        return {
            "success": False,
            "status": "error",
            "diagnostic": diag if diag in ("missing_database_url", "invalid_database_url") else "invalid_database_url",
            "message": "DATABASE_URL configuration error."
        }
    except Exception as exc:
        import re
        diag = categorize_db_error(exc)
        exc_class = exc.__class__.__name__
        pgcode = getattr(exc, "pgcode", None)
        
        # Get raw error string (pgerror if available, else str(exc))
        raw_error = getattr(exc, "pgerror", None) or str(exc)
        
        # Aggressive sanitization: remove URLs and quoted strings (which often contain hosts/users/passwords)
        safe_error = re.sub(r"postgres(?:ql)?://\S+", "[REDACTED_URL]", str(raw_error))
        safe_error = re.sub(r'\"[^\"]+\"', '"[REDACTED]"', safe_error)
        # Also redact IP addresses just in case
        safe_error = re.sub(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b", "[REDACTED_IP]", safe_error)
        
        return {
            "success": False,
            "status": "error",
            "diagnostic": diag,
            "exception_class": exc_class,
            "pgcode": pgcode,
            "pgerror_sanitized": safe_error,
            "message": "Failed to connect to the database. Please verify connection settings."
        }


def verify_tables_exist() -> Dict[str, Any]:
    """
    Verifies that the three required tables exist in the database:
    - markets
    - commodities
    - market_prices
    
    Performs only a read-only metadata check on information_schema.tables.
    Does NOT insert, update, or delete any rows.
    """
    db_url = get_database_url()
    if not db_url:
        return {
            "verified": False,
            "message": "DATABASE_URL is not configured. Cannot verify tables.",
            "tables": {
                "markets": False,
                "commodities": False,
                "market_prices": False
            }
        }

    required_tables = ["markets", "commodities", "market_prices"]
    table_status = {t: False for t in required_tables}

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT table_name
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                      AND table_name = ANY(%s);
                    """,
                    (required_tables,)
                )
                found = [row[0] for row in cur.fetchall()]
                for t in required_tables:
                    table_status[t] = t in found

        all_exist = all(table_status.values())
        return {
            "verified": all_exist,
            "message": "All required tables exist." if all_exist else "One or more tables are missing.",
            "tables": table_status
        }
    except Exception:
        return {
            "verified": False,
            "message": "Could not check tables due to database connection error.",
            "tables": table_status
        }
