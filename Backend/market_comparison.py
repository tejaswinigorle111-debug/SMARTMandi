import os
from dataclasses import dataclass
from typing import Any

from dotenv import load_dotenv


_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")


class CostConfigurationError(Exception):
    def __init__(self, missing: list[str]):
        self.missing = missing
        super().__init__("Missing net realization cost configuration: " + ", ".join(missing))


@dataclass(frozen=True)
class CostConfiguration:
    transport_rate_per_km_per_kg: float
    storage_cost_per_kg: float
    platform_fee_percent: float
    other_cost_per_kg: float


def _configured_number(name: str, *, minimum: float = 0) -> float | None:
    raw = os.environ.get(name)
    if raw is None or not raw.strip():
        return None
    try:
        value = float(raw)
    except ValueError:
        return None
    return value if value >= minimum else None


def load_cost_configuration() -> CostConfiguration:
    if os.path.exists(_ENV_PATH):
        load_dotenv(dotenv_path=_ENV_PATH, override=True)

    values = {
        "TRANSPORT_RATE_PER_KM_PER_KG": _configured_number("TRANSPORT_RATE_PER_KM_PER_KG", minimum=0),
        "STORAGE_COST_PER_KG": _configured_number("STORAGE_COST_PER_KG", minimum=0),
        "PLATFORM_FEE_PERCENT": _configured_number("PLATFORM_FEE_PERCENT", minimum=0),
        "OTHER_COST_PER_KG": _configured_number("OTHER_COST_PER_KG", minimum=0),
    }
    missing = [name for name, value in values.items() if value is None]
    if values["PLATFORM_FEE_PERCENT"] is not None and values["PLATFORM_FEE_PERCENT"] > 100:
        missing.append("PLATFORM_FEE_PERCENT (must be <= 100)")
    if missing:
        raise CostConfigurationError(missing)
    return CostConfiguration(
        transport_rate_per_km_per_kg=values["TRANSPORT_RATE_PER_KM_PER_KG"],
        storage_cost_per_kg=values["STORAGE_COST_PER_KG"],
        platform_fee_percent=values["PLATFORM_FEE_PERCENT"],
        other_cost_per_kg=values["OTHER_COST_PER_KG"],
    )


def compare_markets(markets: list[dict[str, Any]], quantity_kg: float) -> list[dict[str, Any]]:
    if quantity_kg <= 0:
        raise ValueError("quantity must be greater than zero")
    configuration = load_cost_configuration()
    results: list[dict[str, Any]] = []

    for market in markets:
        price_per_kg = market.get("price_per_kg")
        straight_line_distance = market.get("straight_line_distance_km", market.get("distance_km"))
        if price_per_kg is None or straight_line_distance is None:
            continue
        road_distance = market.get("road_distance_km")
        distance_used = road_distance if road_distance is not None else straight_line_distance
        gross_income = float(price_per_kg) * quantity_kg
        transport_cost = float(distance_used) * quantity_kg * configuration.transport_rate_per_km_per_kg
        storage_cost = quantity_kg * configuration.storage_cost_per_kg
        platform_fee = gross_income * configuration.platform_fee_percent / 100
        other_cost = quantity_kg * configuration.other_cost_per_kg
        net_realization = gross_income - transport_cost - storage_cost - platform_fee - other_cost
        results.append({
            **market,
            "distance_km": round(float(distance_used), 1),
            "straight_line_distance_km": round(float(straight_line_distance), 1),
            "road_distance_km": round(float(road_distance), 1) if road_distance is not None else None,
            "distance_type": "road" if road_distance is not None else "straight-line",
            "gross_income": round(gross_income, 2),
            "transport_cost": round(transport_cost, 2),
            "storage_cost": round(storage_cost, 2),
            "platform_fee": round(platform_fee, 2),
            "other_cost": round(other_cost, 2),
            "net_realization": round(net_realization, 2),
            "calculation_state": "estimated",
            "cost_inputs": {
                "transport_rate_per_km_per_kg": configuration.transport_rate_per_km_per_kg,
                "storage_cost_per_kg": configuration.storage_cost_per_kg,
                "platform_fee_percent": configuration.platform_fee_percent,
                "other_cost_per_kg": configuration.other_cost_per_kg,
            },
        })

    results.sort(key=lambda item: item["net_realization"], reverse=True)
    if not results:
        raise ValueError("No markets have enough distance and price data for comparison")

    best = results[0]
    for item in results:
        item["comparison_explanation"] = build_explanation(item, best)
    return results


def build_explanation(item: dict[str, Any], best: dict[str, Any]) -> str:
    item_name = item.get("market", item.get("name", "this market"))
    best_name = best.get("market", best.get("name", "the selected market"))
    if item_name == best_name:
        return "This market ranks first by estimated net realization after transport, storage, platform, and other configured costs. This is an estimate, not a financial guarantee."
    if item["price_per_kg"] < best["price_per_kg"] and item["net_realization"] > best["net_realization"]:
        return f"{item_name} has a lower listed price but may provide higher net realization because transportation and other configured costs are lower. This is an estimate, not a financial guarantee."
    return "This comparison includes configured cost estimates and official market data. Actual realization may differ."
