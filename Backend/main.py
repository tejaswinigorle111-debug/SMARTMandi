# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from data.markets import MARKETS


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
            "net_return": round(net_return, 2)
        })

    results.sort(
        key=lambda market: market["net_return"],
        reverse=True
    )

    best_market = results[0]

    return {
        "success": True,
        "crop": request.crop,
        "quantity_kg": quantity,
        "farmer_location": request.location,
        "recommended_market": best_market,
        "all_markets": results
    }