import os
import math
import requests
from dotenv import load_dotenv
from data.markets import MARKETS

_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
_GOVERNMENT_DATA_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
_REVERSE_GEOCODING_URL = "https://nominatim.openstreetmap.org/reverse"
_GEOCODING_CACHE = {}
_REVERSE_GEOCODING_CACHE = {}
_GOVERNMENT_HEADERS = {
    "User-Agent": "Mozilla/5.0 SMARTMandi/1.0",
    "Accept": "application/json",
}


def _load_api_key():
    if os.path.exists(_ENV_PATH):
        load_dotenv(dotenv_path=_ENV_PATH, override=True)
    return os.environ.get("DATA_GOV_API_KEY")


def _fallback_markets(crop=None):
    markets = MARKETS
    if crop:
        markets = [market for market in markets if market["crop"].lower() == crop.lower()]
    return markets


def _geocode(query):
    normalized_query = query.strip().lower()
    if not normalized_query:
        return None
    if normalized_query in _GEOCODING_CACHE:
        return _GEOCODING_CACHE[normalized_query]

    try:
        response = requests.get(
            _GEOCODING_URL,
            params={"name": query, "count": 1, "language": "en", "format": "json"},
            timeout=5,
        )
        response.raise_for_status()
        result = response.json().get("results", [])
        coordinates = (
            (float(result[0]["latitude"]), float(result[0]["longitude"]))
            if result else None
        )
    except (requests.RequestException, ValueError, KeyError, TypeError):
        coordinates = None

    _GEOCODING_CACHE[normalized_query] = coordinates
    return coordinates


def reverse_geocode(latitude, longitude):
    """Resolve GPS coordinates to a human-readable place."""
    cache_key = (round(latitude, 5), round(longitude, 5))
    if cache_key in _REVERSE_GEOCODING_CACHE:
        return _REVERSE_GEOCODING_CACHE[cache_key]

    try:
        response = requests.get(
            _REVERSE_GEOCODING_URL,
            params={"lat": latitude, "lon": longitude, "format": "jsonv2", "zoom": 10},
            headers={"User-Agent": "SMARTMandi/1.0 agricultural market decision support"},
            timeout=8,
        )
        response.raise_for_status()
        address = response.json().get("address", {})
        place = ", ".join(value for value in (
            address.get("village") or address.get("town") or address.get("city"),
            address.get("state_district") or address.get("district"),
            address.get("state"),
        ) if value)
        result = {
            "name": place or "GPS location",
            "state": address.get("state"),
            "latitude": latitude,
            "longitude": longitude,
        }
    except (requests.RequestException, ValueError, TypeError):
        result = {"name": "GPS location", "state": None, "latitude": latitude, "longitude": longitude}

    _REVERSE_GEOCODING_CACHE[cache_key] = result
    return result


def _distance_km(origin, destination):
    if not origin or not destination:
        return None

    origin_lat, origin_lng = map(math.radians, origin)
    destination_lat, destination_lng = map(math.radians, destination)
    delta_lat = destination_lat - origin_lat
    delta_lng = destination_lng - origin_lng
    haversine = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(origin_lat) * math.cos(destination_lat) * math.sin(delta_lng / 2) ** 2
    )
    return round(6371 * 2 * math.asin(math.sqrt(haversine)), 1)


def fetch_live_markets(crop=None, location=None, latitude=None, longitude=None):
    """Return live nearby mandi prices, using local seed data only without an origin."""
    api_key = _load_api_key()
    if not api_key:
        return [], False

    params = {
        "api-key": api_key,
        "format": "json",
        "limit": 500,
    }
    if crop:
        params["filters[commodity]"] = crop

    origin = (latitude, longitude) if latitude is not None and longitude is not None else _geocode(location or "")
    origin_state = None
    if latitude is not None and longitude is not None:
        origin_state = reverse_geocode(latitude, longitude).get("state")
    if origin_state:
        params["filters[state]"] = origin_state

    try:
        response = requests.get(
            _GOVERNMENT_DATA_URL,
            params=params,
            headers=_GOVERNMENT_HEADERS,
            timeout=(5, 30),
        )
        response.raise_for_status()
        records = response.json().get("records", [])
    except (requests.RequestException, ValueError):
        return [], False

    live_markets = []
    for index, record in enumerate(records):
        try:
            price = float(record.get("modal_price", 0)) / 100
        except (TypeError, ValueError):
            continue
        if price <= 0:
            continue

        market_name = record.get("market") or "Maharashtra Mandi"
        district = record.get("district") or "Unknown district"
        state = record.get("state") or "India"
        market_coordinates = _geocode(f"{district}, {state}, India")
        distance = _distance_km(origin, market_coordinates)
        if distance is None:
            continue
        live_markets.append({
            "id": f"live-{index}",
            "name": market_name,
            "location": f"{district}, {state}",
            "state": state,
            "crop": record.get("commodity") or crop or "Unknown",
            "price_per_kg": round(price, 2),
            "distance_km": distance,
            "transport_rate": 0.05,
            "arrival_quantity": record.get("arrival_quantity"),
            "price_date": record.get("arrival_date"),
        })

    if live_markets and origin:
        live_markets.sort(key=lambda market: market["distance_km"])

    if live_markets:
        return live_markets, True
    return [], False

def test_gov_data_api():
    """
    Safely tests the connection to the data.gov.in API using DATA_GOV_API_KEY.
    Requests a small number of records (limit=5) from Maharashtra.
    NEVER logs or returns the API key.
    """
    api_key = _load_api_key()
    
    if not api_key:
        return {
            "success": False,
            "status": "unconfigured",
            "message": "DATA_GOV_API_KEY is missing in Backend/.env"
        }
        
    # The official data.gov.in resource ID provided by the user
    url = _GOVERNMENT_DATA_URL
    
    params = {
        "api-key": api_key,
        "format": "json",
        "limit": 5,
        "filters[state]": "Maharashtra"
    }
    
    try:
        response = requests.get(
            url,
            params=params,
            headers=_GOVERNMENT_HEADERS,
            timeout=(5, 30),
        )
        
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
