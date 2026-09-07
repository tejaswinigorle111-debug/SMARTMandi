import os
from typing import Any

import requests
from dotenv import load_dotenv

from location import distance_km, validate_coordinates


_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
_OPEN_METEO_GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"
_NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"
_GOOGLE_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
_GOOGLE_ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes"
_HEADERS = {"User-Agent": "SMARTMandi/1.0 location service", "Accept": "application/json"}


def _google_key() -> str | None:
    if os.path.exists(_ENV_PATH):
        load_dotenv(dotenv_path=_ENV_PATH, override=True)
    return os.environ.get("GOOGLE_MAPS_API_KEY")


def _coordinates(value: Any) -> tuple[float, float] | None:
    try:
        latitude = float(value[0])
        longitude = float(value[1])
        validate_coordinates(latitude, longitude)
        return latitude, longitude
    except (TypeError, ValueError, IndexError, KeyError):
        return None


def geocode_location(query: str) -> dict[str, Any] | None:
    query = query.strip()
    if not query:
        return None

    key = _google_key()
    if key:
        try:
            response = requests.get(
                _GOOGLE_GEOCODE_URL,
                params={"address": query, "components": "country:IN", "key": key},
                headers=_HEADERS,
                timeout=8,
            )
            response.raise_for_status()
            result = response.json().get("results", [])
            if result:
                location = result[0]["geometry"]["location"]
                coordinates = _coordinates((location["lat"], location["lng"]))
                if coordinates:
                    return {"latitude": coordinates[0], "longitude": coordinates[1], "display_name": result[0].get("formatted_address"), "provider": "Google Geocoding API"}
        except (requests.RequestException, ValueError, KeyError, TypeError):
            pass

    try:
        response = requests.get(
            _OPEN_METEO_GEOCODE_URL,
            params={"name": query, "count": 1, "language": "en", "format": "json", "countryCode": "IN"},
            headers=_HEADERS,
            timeout=8,
        )
        response.raise_for_status()
        result = response.json().get("results", [])
        if result:
            coordinates = _coordinates((result[0]["latitude"], result[0]["longitude"]))
            if coordinates:
                parts = [result[0].get("name"), result[0].get("admin2"), result[0].get("admin1")]
                return {"latitude": coordinates[0], "longitude": coordinates[1], "display_name": ", ".join(part for part in parts if part), "provider": "Open-Meteo Geocoding"}
    except (requests.RequestException, ValueError, KeyError, TypeError):
        pass
    return None


def reverse_geocode_location(latitude: float, longitude: float) -> dict[str, Any]:
    validate_coordinates(latitude, longitude)
    key = _google_key()
    if key:
        try:
            response = requests.get(_GOOGLE_GEOCODE_URL, params={"latlng": f"{latitude},{longitude}", "key": key}, headers=_HEADERS, timeout=8)
            response.raise_for_status()
            result = response.json().get("results", [])
            if result:
                components = {
                    component_type: component.get("long_name")
                    for component in result[0].get("address_components", [])
                    for component_type in component.get("types", [])
                }
                return {"name": result[0].get("formatted_address", "GPS location"), "state": components.get("administrative_area_level_1"), "district": components.get("administrative_area_level_2"), "latitude": latitude, "longitude": longitude, "provider": "Google Geocoding API"}
        except (requests.RequestException, ValueError, KeyError, TypeError):
            pass

    try:
        response = requests.get(_NOMINATIM_REVERSE_URL, params={"lat": latitude, "lon": longitude, "format": "jsonv2", "zoom": 10}, headers=_HEADERS, timeout=8)
        response.raise_for_status()
        payload = response.json()
        address = payload.get("address", {})
        return {"name": payload.get("display_name", "GPS location"), "state": address.get("state"), "district": address.get("state_district") or address.get("district"), "latitude": latitude, "longitude": longitude, "provider": "Nominatim reverse geocoding"}
    except (requests.RequestException, ValueError, TypeError):
        return {"name": "GPS location", "state": None, "district": None, "latitude": latitude, "longitude": longitude, "provider": None}


def road_route(latitude1: float, longitude1: float, latitude2: float, longitude2: float) -> dict[str, Any] | None:
    validate_coordinates(latitude1, longitude1)
    validate_coordinates(latitude2, longitude2)
    key = _google_key()
    if not key:
        return None
    try:
        response = requests.post(
            _GOOGLE_ROUTES_URL,
            headers={"Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": "routes.distanceMeters,routes.duration"},
            json={"origin": {"location": {"latLng": {"latitude": latitude1, "longitude": longitude1}}}, "destination": {"location": {"latLng": {"latitude": latitude2, "longitude": longitude2}}}, "travelMode": "DRIVE", "routingPreference": "TRAFFIC_AWARE"},
            timeout=10,
        )
        response.raise_for_status()
        route = response.json().get("routes", [])[0]
        return {"distance_km": round(float(route["distanceMeters"]) / 1000, 1), "duration": route.get("duration"), "distance_type": "road", "provider": "Google Routes API"}
    except (requests.RequestException, ValueError, KeyError, IndexError, TypeError):
        return None


def location_distance(latitude1: float, longitude1: float, latitude2: float, longitude2: float) -> dict[str, Any]:
    straight_line = distance_km(latitude1, longitude1, latitude2, longitude2)
    route = road_route(latitude1, longitude1, latitude2, longitude2)
    return {"straight_line_distance_km": straight_line, "road_distance_km": route["distance_km"] if route else None, "road_duration": route["duration"] if route else None, "distance_type": "road" if route else "straight-line", "provider": route["provider"] if route else "Haversine formula"}
