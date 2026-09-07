import math


EARTH_RADIUS_KM = 6371.0


def validate_coordinates(latitude: float, longitude: float) -> None:
    if not -90 <= latitude <= 90:
        raise ValueError("latitude must be between -90 and 90")
    if not -180 <= longitude <= 180:
        raise ValueError("longitude must be between -180 and 180")


def distance_km(
    latitude1: float,
    longitude1: float,
    latitude2: float,
    longitude2: float,
) -> float:
    """Return great-circle distance between two WGS84 coordinate pairs."""
    validate_coordinates(latitude1, longitude1)
    validate_coordinates(latitude2, longitude2)

    origin_latitude = math.radians(latitude1)
    destination_latitude = math.radians(latitude2)
    delta_latitude = math.radians(latitude2 - latitude1)
    delta_longitude = math.radians(longitude2 - longitude1)

    haversine = (
        math.sin(delta_latitude / 2) ** 2
        + math.cos(origin_latitude)
        * math.cos(destination_latitude)
        * math.sin(delta_longitude / 2) ** 2
    )
    return round(
        EARTH_RADIUS_KM * 2 * math.asin(math.sqrt(min(1.0, haversine))),
        1,
    )
