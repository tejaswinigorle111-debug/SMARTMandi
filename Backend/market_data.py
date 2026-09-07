import os
from datetime import datetime, timezone
from typing import Any

import requests
from dotenv import load_dotenv



_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
_DATA_GOV_RESOURCE_URL = "https://api.data.gov.in/resource"
_DATA_GOV_SOURCE = "data.gov.in"
_HEADERS = {
    "User-Agent": "SMARTMandi/1.0 official agricultural data client",
    "Accept": "application/json",
}


class MarketDataService:
    """Official market-data adapter with explicit live/cache/unavailable states."""

    def __init__(self) -> None:
        self._live_cache: dict[str, dict[str, Any]] = {}
        self._history_cache: list[dict[str, Any]] = []

    def _load_config(self) -> tuple[str | None, str | None, str | None]:
        if os.path.exists(_ENV_PATH):
            load_dotenv(dotenv_path=_ENV_PATH, override=True)
        return (
            os.environ.get("DATA_GOV_API_KEY"),
            os.environ.get("DATA_GOV_RESOURCE_ID"),
            os.environ.get("DATA_GOV_PRICE_UNIT"),
        )

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

    def getNearbyMarketPrices(
        self,
        *,
        crop: str | None = None,
        location: str | None = None,
        latitude: float | None = None,
        longitude: float | None = None,
    ) -> dict[str, Any]:
        state = None
        records_result = self.getMarketPrices(crop=crop, state=state)
        if records_result["data_state"] == "unavailable":
            return records_result

        return records_result


market_data_service = MarketDataService()
