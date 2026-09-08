from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from math import sqrt
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
    metrics: dict[str, Any]
    price_history: dict[str, list[dict[str, Any]]]

    def as_dict(self) -> dict[str, Any]:
        return {
            "status": self.status,
            "summary": self.summary,
            "recommendation": self.recommendation,
            "recommendation_type": self.recommendation_type,
            "uncertainty": self.uncertainty,
            "insights": self.insights,
            "data_availability": self.data_availability,
            "metrics": self.metrics,
            "price_history": self.price_history,
        }


class AIService:
    """Data-grounded market intelligence; it never creates missing market facts."""

    def analyze_market_data(self, verified_data: dict[str, Any]) -> dict[str, Any]:
        markets = [item for item in verified_data.get("markets", []) if self._valid_market(item)]
        history = [item for item in verified_data.get("historical_prices", []) if self._valid_history(item)]
        data_state = verified_data.get("data_state", "unavailable")
        crop = verified_data.get("crop") or "the selected crop"
        location = verified_data.get("farmer_location") or "the provided location"

        metrics = self._build_metrics(history, markets)
        availability = {
            "current_price": "available" if markets else "unavailable",
            "historical_price": "available" if metrics["history_available"] else "insufficient",
            "market_arrivals": "available" if any(item.get("arrival_quantity") is not None for item in markets) else "unavailable",
            "freshness": "available" if metrics["freshness_days"] is not None else "unavailable",
            "volatility": "available" if metrics["volatility_percent"] is not None else "insufficient",
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
                insights=[], metrics=metrics, price_history=metrics["price_history"],
                data_availability=availability,
            ).as_dict()

        if not metrics["history_available"]:
            return IntelligenceResult(
                status="insufficient_data",
                summary=f"Current {crop} prices are available, but historical evidence is insufficient.",
                recommendation="Unavailable: at least two dated official prices are required before deciding whether to sell now, hold, or monitor.",
                recommendation_type="insufficient_data",
                uncertainty="Historical prices, trend, volatility, and freshness cannot be established from the available records.",
                insights=["No recommendation was inferred from missing historical data."],
                metrics=metrics, price_history=metrics["price_history"],
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
        trend = metrics["trend_direction"]
        insights.append(f"The dated official series indicates a {trend} price trend for {crop}.")
        if metrics["volatility_percent"] is not None:
            insights.append(f"Observed price volatility is {metrics['volatility_percent']:.1f}% over the available 30-day series.")
        if not any(item.get("arrival_quantity") is not None for item in markets):
            insights.append("Arrival data is unavailable, so supply pressure could not be assessed.")
        if verified_data.get("demand") is None:
            insights.append("Verified demand data is unavailable and was not inferred from price alone.")

        current_price = float(best["price_per_kg"])
        average_30 = metrics["average_price_30d"]
        if data_state != "live":
            recommendation_type = "monitor"
            recommendation = "Monitor: the latest official comparison is cached, so current local conditions may have changed."
            uncertainty = "Fresh live data was not available for this calculation."
        elif trend == "falling" and average_30 is not None and current_price >= average_30:
            recommendation_type = "sell_now"
            recommendation = f"Sell now: the current reference price of ₹{current_price:.2f}/kg is at or above the 30-day average of ₹{average_30:.2f}/kg while the dated trend is falling."
            uncertainty = "This is an estimate from official prices only; negotiated terms, demand, and local costs may differ."
        elif trend == "rising" and average_30 is not None and current_price < average_30:
            recommendation_type = "hold"
            recommendation = f"Hold: the dated trend is rising and the current reference price of ₹{current_price:.2f}/kg is below the 30-day average of ₹{average_30:.2f}/kg."
            uncertainty = "A rising historical trend does not guarantee future prices; confirm local demand and storage costs."
        else:
            recommendation_type = "monitor"
            recommendation = f"Monitor: the current reference price of ₹{current_price:.2f}/kg is not supported by a clear sell-now or hold signal against the 30-day trend and average."
            uncertainty = "The calculation does not include verified demand or seasonality evidence."

        result = IntelligenceResult(
            status="available",
            summary=f"For {crop}, {best['market']} has the highest estimated net realization among the available markets.",
            recommendation=recommendation,
            recommendation_type=recommendation_type,
            uncertainty=uncertainty,
            insights=insights,
            data_availability=availability,
            metrics=metrics,
            price_history=metrics["price_history"],
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

    @classmethod
    def _build_metrics(cls, history: list[dict[str, Any]], markets: list[dict[str, Any]]) -> dict[str, Any]:
        dated: list[tuple[date, float, float | None]] = []
        for item in history:
            parsed = cls._parse_date(item.get("date"))
            price = item.get("price_per_kg")
            if price is None and item.get("modal_price") is not None:
                price = float(item["modal_price"]) / 100 if item.get("unit") == "INR/quintal" else float(item["modal_price"])
            if parsed and price is not None and float(price) > 0:
                dated.append((parsed, float(price), float(item["arrival_quantity"]) if item.get("arrival_quantity") is not None else None))

        daily: dict[date, list[tuple[float, float | None]]] = {}
        for day, price, arrival in dated:
            daily.setdefault(day, []).append((price, arrival))
        daily_prices = sorted({day: sum(price for price, _ in values) / len(values) for day, values in daily.items()}.items())
        today = datetime.now(timezone.utc).date()

        def series(days: int) -> list[dict[str, Any]]:
            cutoff = today - timedelta(days=days - 1)
            return [{"date": day.isoformat(), "price_per_kg": round(price, 2)} for day, price in daily_prices if day >= cutoff and day <= today]

        series_30 = series(30)
        prices_30 = [item["price_per_kg"] for item in series_30]
        latest_date = daily_prices[-1][0] if daily_prices else None
        latest_prices = [price for day, price in daily_prices if day == latest_date] if latest_date else []
        arrivals = [arrival for day, values in daily.items() if day == latest_date for _, arrival in values if arrival is not None]
        volatility = None
        if len(prices_30) >= 2 and sum(prices_30) > 0:
            mean = sum(prices_30) / len(prices_30)
            volatility = round((sqrt(sum((price - mean) ** 2 for price in prices_30) / len(prices_30)) / mean) * 100, 2)
        trend = "unavailable"
        change_percent = None
        if len(prices_30) >= 2 and prices_30[0] > 0:
            change_percent = round(((prices_30[-1] - prices_30[0]) / prices_30[0]) * 100, 2)
            trend = "rising" if change_percent > 2 else "falling" if change_percent < -2 else "stable"
        return {
            "history_available": len(daily_prices) >= 2,
            "trend_direction": trend,
            "change_percent_30d": change_percent,
            "average_price_30d": round(sum(prices_30) / len(prices_30), 2) if prices_30 else None,
            "volatility_percent": volatility,
            "freshness_days": (today - latest_date).days if latest_date else None,
            "latest_arrival_quantity": round(sum(arrivals), 3) if arrivals else None,
            "price_history": {"7d": series(7), "30d": series_30},
        }

    @staticmethod
    def _parse_date(value: Any) -> date | None:
        if value is None:
            return None
        text = str(value).strip()
        for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d.%m.%Y"):
            try:
                return datetime.strptime(text, fmt).date()
            except ValueError:
                continue
        try:
            return datetime.fromisoformat(text.replace("Z", "+00:00")).date()
        except ValueError:
            return None

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
