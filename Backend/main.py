# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from data.markets import MARKETS
from database import test_db_connection, verify_tables_exist


app = FastAPI(
    title="SMARTMandi API",
    description="Market decision support system for farmers",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendationRequest(BaseModel):
    crop: str
    quantity: float
    location: str


@app.get("/")
def home():
    return {
        "message": "Welcome to SMARTMandi API",
        "status": "Backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.get("/db-health")
def db_health():
    db_result = test_db_connection()
    diagnostic = db_result.get("diagnostic", "connection_failed")

    if not db_result["success"]:
        return {
            "status": "unhealthy",
            "diagnostic": diagnostic,
            "database": db_result,
            "tables": {
                "verified": False,
                "message": "Database not reachable.",
                "tables": {
                    "markets": False,
                    "commodities": False,
                    "market_prices": False
                }
            }
        }

    tables_result = verify_tables_exist()
    return {
        "status": "healthy" if tables_result["verified"] else "partially_healthy",
        "diagnostic": diagnostic,
        "database": db_result,
        "tables": tables_result
    }


@app.get("/supabase-health")
def supabase_health():
    from supabase_rest import test_supabase_rest_connection
    return test_supabase_rest_connection()


@app.get("/government-data-health")
def government_data_health():
    from gov_data import test_gov_data_api
    return test_gov_data_api()


@app.get("/markets")
def get_markets():
    return {
        "markets": MARKETS
    }


@app.post("/recommend")
def recommend_market(request: RecommendationRequest):

    crop = request.crop.strip().lower()
    quantity = request.quantity

    matching_markets = [
        market
        for market in MARKETS
        if market["crop"].lower() == crop
    ]

    if not matching_markets:
        return {
            "success": False,
            "message": "No markets found for this crop."
        }

    results = []

    for market in matching_markets:

        gross_income = market["price_per_kg"] * quantity

        transport_cost = (
            market["distance_km"]
            * quantity
            * market["transport_rate"]
        )

        net_return = gross_income - transport_cost

        results.append({
            "market": market["name"],
            "location": market["location"],
            "price_per_kg": market["price_per_kg"],
            "distance_km": market["distance_km"],
            "estimated_transport_cost": round(transport_cost, 2),
            "gross_income": round(gross_income, 2),
            "net_return": round(net_return, 2),
            "arrival_quantity": market.get("arrival_quantity")
        })

    # Calculate max/min for scoring
    best_net_return = max((m["net_return"] for m in results), default=0)
    best_price = max((m["price_per_kg"] for m in results), default=0)
    best_distance = min((m["distance_km"] for m in results), default=0)
    best_transport = min((m["estimated_transport_cost"] for m in results), default=0)

    for m in results:
        # Net Return Score (Higher is better)
        if best_net_return > 0:
            net_return_score = (m["net_return"] / best_net_return) * 100
        else:
            net_return_score = 100 if m["net_return"] == best_net_return else 0

        # Price Score (Higher is better)
        if best_price > 0:
            price_score = (m["price_per_kg"] / best_price) * 100
        else:
            price_score = 100 if m["price_per_kg"] == best_price else 0
            
        # Distance Score (Lower is better)
        if m["distance_km"] > 0:
            distance_score = (best_distance / m["distance_km"]) * 100
        else:
            distance_score = 100
            
        # Transport Cost Score (Lower is better)
        if m["estimated_transport_cost"] > 0:
            transport_score = (best_transport / m["estimated_transport_cost"]) * 100
        else:
            transport_score = 100

        # Overall Score
        overall_score = (
            (net_return_score * 0.60) +
            (price_score * 0.20) +
            (distance_score * 0.10) +
            (transport_score * 0.10)
        )

        m["score_breakdown"] = {
            "net_return_score": round(net_return_score, 1),
            "price_score": round(price_score, 1),
            "distance_score": round(distance_score, 1),
            "transport_score": round(transport_score, 1)
        }
        m["smart_market_score"] = round(overall_score, 1)

    results.sort(
        key=lambda market: market["smart_market_score"],
        reverse=True
    )

    best_market = results[0]
    best_market["smart_market_explanation"] = "This market achieved the highest Smart Market Score by providing the most optimal balance of high net returns and favorable logistical factors."

    return {
        "success": True,
        "crop": request.crop,
        "quantity_kg": quantity,
        "farmer_location": request.location,
        "recommended_market": best_market,
        "all_markets": results
    }