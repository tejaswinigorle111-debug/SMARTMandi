import os
from datetime import datetime, timedelta, timezone
from typing import Any

import requests
from dotenv import load_dotenv

from location import distance_km
from location_service import geocode_location, reverse_geocode_location, road_route
from market_comparison import load_cost_configuration


_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
_DATA_GOV_RESOURCE_URL = "https://api.data.gov.in/resource"
_DATA_GOV_SOURCE = "data.gov.in"
_DEFAULT_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
_HEADERS = {
    "User-Agent": "SMARTMandi/1.0 official agricultural data client",
    "Accept": "application/json",
}
_GEOCODE_CACHE: dict[str, tuple[float, float] | None] = {}


class MarketDataService:
    """Official market-data adapter with explicit live/cache/unavailable states."""

    def __init__(self) -> None:
        self._live_cache: dict[str, dict[str, Any]] = {}
        self._history_cache: list[dict[str, Any]] = []

    def _load_config(self) -> tuple[str | None, str | None, str | None]:
        if os.path.exists(_ENV_PATH):
            load_dotenv(dotenv_path=_ENV_PATH, override=True)
        resource_id = (os.environ.get("DATA_GOV_RESOURCE_ID") or "").strip() or _DEFAULT_RESOURCE_ID
        return (
            os.environ.get("DATA_GOV_API_KEY"),
            resource_id,
            os.environ.get("DATA_GOV_PRICE_UNIT") or "INR/quintal",
        )

    @staticmethod
    def _nearby_radius_km() -> float:
        try:
            configured = float(os.environ.get("MAX_NEARBY_MARKET_DISTANCE_KM", "100"))
            return configured if configured > 0 else 100.0
        except (TypeError, ValueError):
            return 100.0

    @staticmethod
    def _max_price_age_days() -> int | None:
        raw = os.environ.get("MAX_PRICE_AGE_DAYS", "7")
        if raw is None or not str(raw).strip():
            return 7
        try:
            value = int(raw)
            return value if value > 0 else None
        except (TypeError, ValueError):
            return 7

    @staticmethod
    def _cache_key(crop: str | None, state: str | None, district: str | None) -> str:
        return "|".join((crop or "", state or "", district or "")).lower()

    @staticmethod
    def _number(value: Any) -> float | None:
        try:
            number = float(value)
            return number if number >= 0 else None
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _parse_price_date(value: Any) -> datetime | None:
        if value is None:
            return None
        text = str(value).strip()
        if not text:
            return None
        for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d.%m.%Y"):
            try:
                return datetime.strptime(text, fmt).replace(tzinfo=timezone.utc)
            except ValueError:
                continue
        try:
            return datetime.fromisoformat(text.replace("Z", "+00:00"))
        except ValueError:
            return None

    def _is_fresh(self, record: dict[str, Any]) -> bool:
        max_age = self._max_price_age_days()
        if max_age is None:
            return True
        price_date = self._parse_price_date(record.get("date") or record.get("last_updated"))
        if price_date is None:
            return True
        cutoff = datetime.now(timezone.utc) - timedelta(days=max_age)
        return price_date >= cutoff

    def _geocode_cached(self, query: str) -> tuple[float, float] | None:
        key = query.strip().lower()
        if not key:
            return None
        if key in _GEOCODE_CACHE:
            return _GEOCODE_CACHE[key]
        result = geocode_location(query)
        coordinates = (
            (float(result["latitude"]), float(result["longitude"]))
            if result
            else None
        )
        _GEOCODE_CACHE[key] = coordinates
        return coordinates

    def _transport_rate(self) -> float:
        try:
            return load_cost_configuration().transport_rate_per_km_per_kg
        except Exception:
            return 0.05

    def _normalise_record(self, record: dict[str, Any], index: int, price_unit: str) -> dict[str, Any] | None:
        commodity = (record.get("commodity") or record.get("crop") or "").strip()
        market = (record.get("market") or "").strip()
        state = (record.get("state") or "").strip()
        district = (record.get("district") or "").strip()
        minimum_price = self._number(record.get("min_price"))
        maximum_price = self._number(record.get("max_price"))
        modal_price = self._number(record.get("modal_price"))
        if not commodity or not market or not state or modal_price is None:
            return None

        date_value = record.get("arrival_date") or record.get("price_date") or record.get("date")
        arrival_quantity = self._number(record.get("arrival_quantity"))
        price_per_kg = None
        minimum_price_per_kg = None
        maximum_price_per_kg = None
        if price_unit == "INR/quintal":
            price_per_kg = round(modal_price / 100, 2)
            minimum_price_per_kg = round(minimum_price / 100, 2) if minimum_price is not None else None
            maximum_price_per_kg = round(maximum_price / 100, 2) if maximum_price is not None else None
        elif price_unit == "INR/kg":
            price_per_kg = modal_price
            minimum_price_per_kg = minimum_price
            maximum_price_per_kg = maximum_price

        if price_per_kg is None or price_per_kg <= 0:
            return None

        return {
            "id": f"live-{index}",
            "crop": commodity,
            "commodity": commodity,
            "market": market,
            "name": market,
            "location": ", ".join(value for value in (district, state) if value),
            "state": state,
            "district": district,
            "date": date_value,
            "price_date": date_value,
            "minimum_price": minimum_price,
            "maximum_price": maximum_price,
            "modal_price": modal_price,
            "arrival_quantity": arrival_quantity,
            "unit": price_unit,
            "price_per_kg": price_per_kg,
            "minimum_price_per_kg": minimum_price_per_kg,
            "maximum_price_per_kg": maximum_price_per_kg,
            "source": _DATA_GOV_SOURCE,
            "last_updated": date_value,
        }

    def _fetch_records(
        self,
        *,
        crop: str | None = None,
        state: str | None = None,
        district: str | None = None,
        limit: int = 500,
    ) -> tuple[list[dict[str, Any]], str | None]:
        api_key, resource_id, price_unit = self._load_config()
        if not api_key:
            return [], "DATA_GOV_API_KEY is not configured"
        if not resource_id:
            return [], "DATA_GOV_RESOURCE_ID is not configured"
        if price_unit not in {"INR/quintal", "INR/kg"}:
            return [], "DATA_GOV_PRICE_UNIT must be INR/quintal or INR/kg"

        params: dict[str, Any] = {
            "api-key": api_key,
            "format": "json",
            "limit": min(max(limit, 1), 5000),
        }
        if crop:
            params["filters[commodity]"] = crop
        if state:
            params["filters[state]"] = state
        if district:
            params["filters[district]"] = district

        try:
            response = requests.get(
                f"{_DATA_GOV_RESOURCE_URL}/{resource_id}",
                params=params,
                headers=_HEADERS,
                timeout=(5, 30),
            )
            response.raise_for_status()
            records = response.json().get("records", [])
        except (requests.RequestException, ValueError, TypeError) as error:
            return [], error.__class__.__name__

        normalised = [
            item
            for index, record in enumerate(records)
            if isinstance(record, dict)
            for item in [self._normalise_record(record, index, price_unit)]
            if item is not None
        ]
        return normalised, None

    def _result(
        self,
        records: list[dict[str, Any]],
        *,
        cache_key: str,
        error: str | None = None,
    ) -> dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        if records:
            self._live_cache[cache_key] = {"records": records, "last_updated": now}
            self._history_cache.extend(records)
            return {
                "records": records,
                "source": _DATA_GOV_SOURCE,
                "data_state": "live",
                "last_updated": now,
                "message": None,
            }

        cached = self._live_cache.get(cache_key)
        if cached:
            return {
                "records": [dict(item, data_state="cached") for item in cached["records"]],
                "source": _DATA_GOV_SOURCE,
                "data_state": "cached",
                "last_updated": cached["last_updated"],
                "message": "Live market data is temporarily unavailable. Showing previously retrieved data.",
            }

        return {
            "records": [],
            "source": None,
            "data_state": "unavailable",
            "last_updated": None,
            "message": "Live market data is temporarily unavailable.",
            "error": error,
        }

    def getMarkets(self, *, state: str | None = None, district: str | None = None) -> dict[str, Any]:
        key = self._cache_key(None, state, district)
        records, error = self._fetch_records(state=state, district=district)
        return self._result(records, cache_key=key, error=error)

    def getMarketPrices(
        self,
        *,
        crop: str | None = None,
        state: str | None = None,
        district: str | None = None,
    ) -> dict[str, Any]:
        key = self._cache_key(crop, state, district)
        records, error = self._fetch_records(crop=crop, state=state, district=district)
        return self._result(records, cache_key=key, error=error)

    def getCropPrices(self, crop: str, *, state: str | None = None) -> dict[str, Any]:
        return self.getMarketPrices(crop=crop, state=state)

    def getMarketHistory(
        self,
        *,
        crop: str | None = None,
        market: str | None = None,
    ) -> dict[str, Any]:
        records = [
            item for item in self._history_cache
            if (not crop or item["commodity"].lower() == crop.lower())
            and (not market or item["market"].lower() == market.lower())
        ]
        if not records:
            return {
                "records": [], "source": None, "data_state": "unavailable", "last_updated": None,
                "message": "Live market history is temporarily unavailable.",
            }
        return {
            "records": [dict(item, data_state="cached") for item in records],
            "source": _DATA_GOV_SOURCE,
            "data_state": "cached",
            "last_updated": max(item.get("last_updated") or "" for item in records),
            "message": "Historical records are from previously retrieved official data and are cached.",
        }

    def getMarketArrivals(
        self,
        *,
        crop: str | None = None,
        state: str | None = None,
    ) -> dict[str, Any]:
        result = self.getMarketPrices(crop=crop, state=state)
        result["records"] = [item for item in result["records"] if item["arrival_quantity"] is not None]
        return result

    def getMarketDetails(self, market: str, *, state: str | None = None) -> dict[str, Any]:
        result = self.getMarketPrices(state=state)
        result["records"] = [item for item in result["records"] if item["market"].lower() == market.lower()]
        if not result["records"] and result["data_state"] == "unavailable":
            result["message"] = "Live market details are temporarily unavailable."
        return result

    def test_connection(self) -> dict[str, Any]:
        """Health check against the configured data.gov.in resource. Never returns the API key."""
        api_key, resource_id, _price_unit = self._load_config()
        if not api_key:
            return {
                "success": False,
                "status": "unconfigured",
                "message": "DATA_GOV_API_KEY is missing in Backend/.env",
            }
        if not resource_id:
            return {
                "success": False,
                "status": "unconfigured",
                "message": "DATA_GOV_RESOURCE_ID is missing in Backend/.env",
            }

        try:
            response = requests.get(
                f"{_DATA_GOV_RESOURCE_URL}/{resource_id}",
                params={
                    "api-key": api_key,
                    "format": "json",
                    "limit": 5,
                    "filters[state]": "Maharashtra",
                },
                headers=_HEADERS,
                timeout=(5, 30),
            )
            if response.status_code != 200:
                return {
                    "success": False,
                    "status": "error",
                    "http_status_code": response.status_code,
                    "message": f"data.gov.in API returned an error status: {response.status_code}",
                }

            data = response.json()
            records = data.get("records", [])
            sample_summary = {}
            if records:
                sample_summary = {
                    "market": records[0].get("market"),
                    "commodity": records[0].get("commodity"),
                    "modal_price": records[0].get("modal_price"),
                    "arrival_date": records[0].get("arrival_date"),
                }
            return {
                "success": True,
                "status": "healthy",
                "resource_id": resource_id,
                "records_received": len(records),
                "total_available_in_dataset": data.get("total", "unknown"),
                "sample_fields_available": list(records[0].keys()) if records else [],
                "sample_record_summary": sample_summary,
                "message": "Successfully connected to data.gov.in API.",
            }
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "status": "error",
                "message": "Connection to data.gov.in API timed out.",
            }
        except requests.exceptions.RequestException as error:
            return {
                "success": False,
                "status": "error",
                "exception_class": error.__class__.__name__,
                "message": "Failed to connect to data.gov.in API.",
            }

    def getNearbyMarketPrices(
        self,
        *,
        crop: str | None = None,
        location: str | None = None,
        latitude: float | None = None,
        longitude: float | None = None,
    ) -> dict[str, Any]:
        """Fetch official prices and keep only markets within the configured radius."""
        origin: tuple[float, float] | None = None
        origin_state: str | None = None

        if latitude is not None and longitude is not None:
            origin = (float(latitude), float(longitude))
            origin_state = reverse_geocode_location(origin[0], origin[1]).get("state")
        elif location and location.strip():
            geocoded = geocode_location(location.strip())
            if geocoded:
                origin = (float(geocoded["latitude"]), float(geocoded["longitude"]))
                origin_state = reverse_geocode_location(origin[0], origin[1]).get("state")

        prices = self.getMarketPrices(crop=crop, state=origin_state)
        if prices["data_state"] == "unavailable":
            return prices

        # If state filter returned nothing, retry without state (still distance-filter later).
        records = list(prices["records"])
        if not records and origin_state:
            fallback = self.getMarketPrices(crop=crop)
            if fallback["records"]:
                prices = fallback
                records = list(fallback["records"])

        if not origin:
            return {
                "records": [],
                "source": prices.get("source"),
                "data_state": "unavailable",
                "last_updated": prices.get("last_updated"),
                "message": "Unable to resolve farmer location for nearby market filtering.",
            }

        radius = self._nearby_radius_km()
        transport_rate = self._transport_rate()
        candidates: list[dict[str, Any]] = []

        for item in records:
            if not self._is_fresh(item):
                continue
            district = (item.get("district") or "").strip()
            state = (item.get("state") or "").strip()
            market_name = (item.get("market") or item.get("name") or "").strip()

            # Prefer district geocoding — APMC market names often fail free geocoders.
            coordinates = None
            if district:
                coordinates = self._geocode_cached(f"{district}, {state}, India")
            if coordinates is None and market_name:
                coordinates = self._geocode_cached(
                    f"{market_name}, {state}, India"
                )
            if coordinates is None:
                continue

            straight_line = distance_km(
                origin[0], origin[1], coordinates[0], coordinates[1]
            )
            enriched = dict(item)
            enriched.update(
                {
                    "latitude": coordinates[0],
                    "longitude": coordinates[1],
                    "distance_km": straight_line,
                    "straight_line_distance_km": straight_line,
                    "road_distance_km": None,
                    "distance_type": "straight-line",
                    "transport_rate": transport_rate,
                    "data_state": prices["data_state"],
                    "directions_url": (
                        "https://www.google.com/maps/dir/?api=1"
                        f"&origin={origin[0]},{origin[1]}"
                        f"&destination={coordinates[0]},{coordinates[1]}"
                        "&travelmode=driving"
                    ),
                }
            )
            candidates.append(enriched)

        candidates.sort(key=lambda market: market["distance_km"])
        nearby = [item for item in candidates if item["distance_km"] <= radius]

        if not nearby:
            return {
                "records": [],
                "source": prices.get("source"),
                "data_state": "unavailable",
                "last_updated": prices.get("last_updated"),
                "message": (
                    f"No fresh official market prices found near this location "
                    f"for this crop (searched within {radius:.0f} km)."
                ),
            }

        # Optionally refine the top markets with road distance when Google is configured.
        for item in nearby[:8]:
            route = road_route(
                origin[0], origin[1], item["latitude"], item["longitude"]
            )
            if not route:
                continue
            item["road_distance_km"] = route["distance_km"]
            item["distance_km"] = route["distance_km"]
            item["distance_type"] = "road"

        nearby.sort(
            key=lambda market: market.get("road_distance_km")
            if market.get("road_distance_km") is not None
            else market["straight_line_distance_km"]
        )

        return {
            "records": nearby,
            "source": _DATA_GOV_SOURCE,
            "data_state": prices["data_state"],
            "last_updated": prices.get("last_updated"),
            "message": prices.get("message"),
        }


market_data_service = MarketDataService()
