from __future__ import annotations

from dataclasses import dataclass
from typing import Any


FORBIDDEN_GUARANTEE_PHRASES = (
    "guaranteed profit",
    "guaranteed return",
    "risk-free",
    "certain profit",
    "will definitely",
)


@dataclass(frozen=True)
class IntelligenceResult:
    status: str
    summary: str
    recommendation: str
    recommendation_type: str
    uncertainty: str
    insights: list[str]
    data_availability: dict[str, str]

    def as_dict(self) -> dict[str, Any]:
        return {
            "status": self.status,
            "summary": self.summary,
            "recommendation": self.recommendation,
            "recommendation_type": self.recommendation_type,
            "uncertainty": self.uncertainty,
            "insights": self.insights,
            "data_availability": self.data_availability,
        }


class AIService:
    """Data-grounded market intelligence; it never creates missing market facts."""

    def analyze_market_data(self, verified_data: dict[str, Any]) -> dict[str, Any]:
        markets = [item for item in verified_data.get("markets", []) if self._valid_market(item)]
        history = [item for item in verified_data.get("historical_prices", []) if self._valid_history(item)]
        data_state = verified_data.get("data_state", "unavailable")
        crop = verified_data.get("crop") or "the selected crop"
        location = verified_data.get("farmer_location") or "the provided location"

        availability = {
            "current_price": "available" if markets else "unavailable",
            "historical_price": "available" if self._has_multiple_dates(history) else "insufficient",
            "market_arrivals": "available" if any(item.get("arrival_quantity") is not None for item in markets) else "unavailable",
            "distance": "available" if all(item.get("distance_km") is not None for item in markets) else "insufficient",
            "transport_cost": "available" if all(item.get("transport_cost") is not None for item in markets) else "insufficient",
            "storage_cost": "available" if all(item.get("storage_cost") is not None for item in markets) else "insufficient",
            "demand": "available" if verified_data.get("demand") is not None else "unavailable",
            "seasonal": "available" if verified_data.get("seasonal") is not None else "unavailable",
        }

        if not markets or data_state == "unavailable":
            return IntelligenceResult(
                status="insufficient_data",
                summary="Not enough reliable data is available to provide a recommendation.",
                recommendation="Not enough reliable data is available to provide a recommendation.",
                recommendation_type="insufficient_data",
                uncertainty="Current official market data is unavailable.",
                insights=[],
                data_availability=availability,
            ).as_dict()

        ranked = sorted(markets, key=lambda item: item["net_realization"], reverse=True)
        best = ranked[0]
        highest_price = max(markets, key=lambda item: item["price_per_kg"])
        insights = [
            f"Based on the available market data for {crop} near {location}, {best['market']} currently offers the highest estimated net realization after configured costs.",
        ]

        if highest_price["market"] != best["market"] and highest_price["price_per_kg"] > best["price_per_kg"]:
            insights.append(
                f"{best['market']} has a lower listed price than {highest_price['market']} but may provide higher net realization because its configured logistics costs are lower."
            )
        if history and self._has_multiple_dates(history):
            trend = self._trend(history)
            insights.append(f"The available historical series indicates a {trend} price trend for {crop}.")
        else:
            insights.append("A reliable multi-date historical price series is not available, so trend confidence is limited.")
        if not any(item.get("arrival_quantity") is not None for item in markets):
            insights.append("Arrival data is unavailable, so supply pressure could not be assessed.")
        if verified_data.get("demand") is None:
            insights.append("Verified demand data is unavailable and was not inferred from price alone.")

        if data_state != "live":
            recommendation_type = "monitor"
            recommendation = "Monitor the market: the comparison uses previously retrieved official data, not a current live response."
            uncertainty = "The available records are cached, so current conditions may have changed."
        elif self._has_multiple_dates(history) and self._trend(history) == "rising":
            recommendation_type = "sell_now"
            recommendation = "Available data supports considering a sale now, subject to confirming current local costs and buyer conditions."
            uncertainty = "This is an estimate based on current official prices and available history; demand, seasonality, and actual negotiated terms may differ."
        else:
            recommendation_type = "monitor"
            recommendation = "Monitor before deciding: current net realization can be compared, but reliable trend or demand evidence is insufficient."
            uncertainty = "Historical, demand, or seasonal evidence is incomplete, so the recommendation has limited confidence."

        result = IntelligenceResult(
            status="available",
            summary=f"For {crop}, {best['market']} has the highest estimated net realization among the available markets.",
            recommendation=recommendation,
            recommendation_type=recommendation_type,
            uncertainty=uncertainty,
            insights=insights,
            data_availability=availability,
        ).as_dict()
        return self._remove_guarantees(result)

    @staticmethod
    def _valid_market(item: dict[str, Any]) -> bool:
        return all(item.get(field) is not None for field in ("market", "price_per_kg", "net_realization"))

    @staticmethod
    def _valid_history(item: dict[str, Any]) -> bool:
        return item.get("date") is not None and item.get("modal_price") is not None

    @staticmethod
    def _has_multiple_dates(history: list[dict[str, Any]]) -> bool:
        return len({str(item.get("date")) for item in history}) >= 2

    @staticmethod
    def _trend(history: list[dict[str, Any]]) -> str:
        ordered = sorted(history, key=lambda item: str(item.get("date")))
        first = float(ordered[0]["modal_price"])
        last = float(ordered[-1]["modal_price"])
        if last > first * 1.02:
            return "rising"
        if last < first * 0.98:
            return "falling"
        return "stable"

    @staticmethod
    def _remove_guarantees(result: dict[str, Any]) -> dict[str, Any]:
        for key in ("summary", "recommendation", "uncertainty"):
            text = result[key].lower()
            if any(phrase in text for phrase in FORBIDDEN_GUARANTEE_PHRASES):
                result[key] = "Not enough reliable data is available to provide a recommendation."
                result["status"] = "insufficient_data"
                result["recommendation_type"] = "insufficient_data"
        return result


ai_service = AIService()
