"""Legacy helpers retained for reverse-geocode callers; market prices use market_data."""

from location_service import reverse_geocode_location
from market_data import market_data_service


def reverse_geocode(latitude, longitude):
    return reverse_geocode_location(latitude, longitude)


def test_gov_data_api():
    return market_data_service.test_connection()


def fetch_live_markets(crop=None, location=None, latitude=None, longitude=None):
    """Compatibility wrapper — prefer market_data_service.getNearbyMarketPrices."""
    result = market_data_service.getNearbyMarketPrices(
        crop=crop,
        location=location,
        latitude=latitude,
        longitude=longitude,
    )
    if not result["records"]:
        return [], False
    return result["records"], result["data_state"] == "live"
