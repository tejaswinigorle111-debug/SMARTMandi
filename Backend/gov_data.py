import os
import requests
from dotenv import load_dotenv
from location import distance_km
from location_service import geocode_location, reverse_geocode_location, road_route
from market_data import market_data_service

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


def _geocode(query):
    normalized_query = query.strip().lower()
    if not normalized_query:
        return None
    if normalized_query not in _GEOCODING_CACHE:
        result = geocode_location(query)
        _GEOCODING_CACHE[normalized_query] = (
            (result["latitude"], result["longitude"]) if result else None
        )
    return _GEOCODING_CACHE[normalized_query]


def reverse_geocode(latitude, longitude):
    """Resolve GPS coordinates through the configured location provider."""
    cache_key = (round(latitude, 5), round(longitude, 5))
    if cache_key in _REVERSE_GEOCODING_CACHE:
        return _REVERSE_GEOCODING_CACHE[cache_key]

    result = reverse_geocode_location(latitude, longitude)

    _REVERSE_GEOCODING_CACHE[cache_key] = result
    return result


def _distance_km(origin, destination):
    if not origin or not destination:
        return None
    return distance_km(origin[0], origin[1], destination[0], destination[1])


def fetch_live_markets(crop=None, location=None, latitude=None, longitude=None, require_distance=True):
    """Compatibility adapter for recommendation calculations."""
    origin = (latitude, longitude) if latitude is not None and longitude is not None else _geocode(location or "")
    origin_state = None
    if origin:
        origin_state = reverse_geocode(origin[0], origin[1]).get("state")

    result = market_data_service.getMarketPrices(crop=crop, state=origin_state)
    records = result["records"]
    if not records:
        return [], False

    live_markets = []
    for record in records:
        market_coordinates = _geocode(f"{record['district']}, {record['state']}, India")
        distance = _distance_km(origin, market_coordinates) if origin else None
        if require_distance and distance is None:
            continue
        route = road_route(origin[0], origin[1], market_coordinates[0], market_coordinates[1]) if origin and market_coordinates else None
        live_markets.append({
            "id": record["id"],
            "name": record["market"],
            "location": record["location"],
            "state": record["state"],
            "crop": record["commodity"],
            "price_per_kg": record["price_per_kg"],
            "distance_km": distance,
            "straight_line_distance_km": distance,
            "road_distance_km": route["distance_km"] if route else None,
            "distance_type": "road" if route else "straight-line",
            "directions_url": f"https://www.google.com/maps/dir/?api=1&origin={origin[0]},{origin[1]}&destination={market_coordinates[0]},{market_coordinates[1]}" if origin and market_coordinates else None,
            "arrival_quantity": record["arrival_quantity"],
            "price_date": record["date"],
            "minimum_price": record["minimum_price"],
            "maximum_price": record["maximum_price"],
            "modal_price": record["modal_price"],
            "unit": record["unit"],
            "source": record["source"],
            "last_updated": record["last_updated"],
            "data_state": result["data_state"],
        })

    if live_markets and origin:
        live_markets.sort(key=lambda market: market["distance_km"])

    if live_markets:
        return live_markets, result["data_state"] == "live"
    return [], False

def test_gov_data_api():
    result = market_data_service.getMarketPrices(state="Maharashtra")
    if result["data_state"] == "unavailable":
        return {
            "success": False,
            "status": "unconfigured" if "not configured" in result.get("message", "") else "error",
            "message": result["message"],
        }

    return {
        "success": result["data_state"] == "live",
        "status": "healthy" if result["data_state"] == "live" else "cached",
        "records_received": len(result["records"]),
        "data_state": result["data_state"],
        "source": result["source"],
        "last_updated": result["last_updated"],
        "message": result.get("message") or "Successfully connected to the official market data source.",
    }
