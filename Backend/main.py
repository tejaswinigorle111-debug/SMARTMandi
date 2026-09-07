# pyrefly: ignore [missing-import]
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from auth import (
    authenticate_user,
    create_session,
    extract_token,
    get_current_user,
    register_user,
    revoke_session,
)
from buyer import (
    create_offer,
    create_order,
    create_review,
    get_listing,
    get_order_tracking,
    list_orders,
    search_listings,
)
from database import test_db_connection, verify_tables_exist
from gov_data import fetch_live_markets, reverse_geocode
from farmer import (
    cancel_listing,
    create_listing,
    get_farmer_dashboard,
    update_farmer_profile,
    update_listing,
)
from location_service import geocode_location, location_distance
from market_data import market_data_service


_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(_ENV_PATH):
    load_dotenv(dotenv_path=_ENV_PATH, override=True)


def _cors_origins() -> list[str]:
    configured = os.environ.get("CORS_ORIGINS", "")
    origins = [origin.strip() for origin in configured.split(",") if origin.strip()]
    return origins or ["http://localhost:3000", "http://127.0.0.1:3000"]


app = FastAPI(
    title="SMARTMandi API",
    description="Market decision support system for farmers",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendationRequest(BaseModel):
    crop: str
    quantity: float
    location: str
    latitude: float | None = None
    longitude: float | None = None


class RegisterRequest(BaseModel):
    email: str | None = None
    phone: str | None = None
    password: str
    full_name: str
    role: str


class LoginRequest(BaseModel):
    identifier: str
    password: str


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


@app.get("/location/reverse")
def reverse_location(latitude: float, longitude: float):
    return reverse_geocode(latitude, longitude)


@app.get("/location/resolve")
def resolve_location(
    address: str | None = None,
    pincode: str | None = None,
    district: str | None = None,
    state: str | None = None,
):
    query = ", ".join(value.strip() for value in (address, pincode, district, state) if value and value.strip())
    if not query:
        raise HTTPException(status_code=422, detail="A location is required")
    result = geocode_location(query)
    if not result:
        raise HTTPException(status_code=404, detail="Location could not be resolved")
    return result


@app.get("/location/distance")
def calculate_location_distance(
    latitude1: float,
    longitude1: float,
    latitude2: float,
    longitude2: float,
):
    return location_distance(latitude1, longitude1, latitude2, longitude2)


@app.get("/markets")
def get_markets(crop: str | None = None):
    result = market_data_service.getMarketPrices(crop=crop)
    return {
        "markets": result["records"],
        "source": result["source"],
        "data_state": result["data_state"],
        "last_updated": result["last_updated"],
        "message": result.get("message"),
    }


@app.post("/recommend")
def recommend_market(request: RecommendationRequest):

    crop = request.crop.strip().lower()
    quantity = request.quantity

    matching_markets, is_live = fetch_live_markets(
        crop=crop,
        location=request.location,
        latitude=request.latitude,
        longitude=request.longitude,
    )

    if not matching_markets:
        return {
            "success": False,
            "message": "Live nearby market data is unavailable for this location right now. Please try again shortly."
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
        "source": "data.gov.in",
        "recommended_market": best_market,
        "all_markets": results
    }


@app.post("/auth/register")
def register(request: RegisterRequest):
    user = register_user(
        email=request.email,
        phone=request.phone,
        password=request.password,
        full_name=request.full_name,
        role=request.role,
    )
    token, expires_at = create_session(user["id"])
    return {"user": user, "token": token, "expires_at": expires_at.isoformat()}


@app.post("/auth/login")
def login(request: LoginRequest):
    user = authenticate_user(request.identifier, request.password)
    token, expires_at = create_session(user["id"])
    return {"user": user, "token": token, "expires_at": expires_at.isoformat()}


@app.get("/auth/me")
def current_user(request: Request):
    return {"user": get_current_user(request)}


@app.post("/auth/logout")
def logout(request: Request):
    token = extract_token(request)
    if token:
        revoke_session(token)
    return {"success": True}


app.add_api_route("/farmer/dashboard", get_farmer_dashboard, methods=["GET"])
app.add_api_route("/farmer/profile", update_farmer_profile, methods=["PATCH"])
app.add_api_route("/farmer/listings", create_listing, methods=["POST"])
app.add_api_route("/farmer/listings/{listing_id}", update_listing, methods=["PATCH"])
app.add_api_route("/farmer/listings/{listing_id}", cancel_listing, methods=["DELETE"])
app.add_api_route("/buyer/listings", search_listings, methods=["GET"])
app.add_api_route("/buyer/listings/{listing_id}", get_listing, methods=["GET"])
app.add_api_route("/buyer/listings/{listing_id}/offers", create_offer, methods=["POST"])
app.add_api_route("/buyer/listings/{listing_id}/orders", create_order, methods=["POST"])
app.add_api_route("/buyer/orders", list_orders, methods=["GET"])
app.add_api_route("/buyer/orders/{order_id}/tracking", get_order_tracking, methods=["GET"])
app.add_api_route("/buyer/orders/{order_id}/reviews", create_review, methods=["POST"])