import os
from datetime import date

# pyrefly: ignore [missing-import]
from fastapi import Depends, FastAPI, HTTPException, Request
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from database import test_db_connection, verify_tables_exist
from gov_data import fetch_live_markets, reverse_geocode
from location import distance_km
from location_service import geocode_location, location_distance, reverse_geocode_location
from market_data import market_data_service
from market_comparison import CostConfigurationError, compare_markets
from ai_service import ai_service
from buyer import (
    OfferCreate,
    OrderCreate,
    ReviewCreate,
    create_offer,
    create_order,
    create_review,
    get_listing,
    get_order_tracking,
    list_orders,
    search_listings,
)
from farmer import (
    FarmerProfileUpdate,
    ListingCreate,
    ListingUpdate,
    cancel_listing,
    create_listing,
    get_farmer_dashboard,
    update_farmer_profile,
    update_listing,
)
from auth import (
    authenticate_user,
    assign_role,
    create_session,
    extract_token,
    get_current_user,
    register_user,
    require_roles,
    revoke_session,
)

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)


app = FastAPI(
    title="SMARTMandi API",
    description="Market decision support system for farmers",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000",
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RecommendationRequest(BaseModel):
    crop: str
    quantity: float = Field(gt=0)
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


class RoleAssignmentRequest(BaseModel):
    role: str


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


@app.post("/auth/register", status_code=201)
def register(request: RegisterRequest):
    user = register_user(
        email=request.email,
        phone=request.phone,
        password=request.password,
        full_name=request.full_name,
        role=request.role,
    )
    token, expires_at = create_session(user["id"])
    return {"user": user, "token": token, "expires_at": expires_at}


@app.post("/auth/login")
def login(request: LoginRequest):
    user = authenticate_user(request.identifier, request.password)
    token, expires_at = create_session(user["id"])
    return {"user": user, "token": token, "expires_at": expires_at}


@app.post("/auth/logout")
def logout(request: Request, user=Depends(get_current_user)):
    token = extract_token(request)
    revoke_session(token)
    return {"success": True}


@app.get("/auth/me")
def current_user(user=Depends(get_current_user)):
    return {"user": user}


@app.get("/admin/access-check")
def admin_access_check(user=Depends(require_roles("ADMIN"))):
    return {"authorized": True, "user_id": user["id"], "roles": user["roles"]}


@app.post("/admin/users/{user_id}/roles")
def admin_assign_role(
    user_id: str,
    request: RoleAssignmentRequest,
    user=Depends(require_roles("ADMIN")),
):
    assign_role(user_id, request.role)
    return {"success": True, "user_id": user_id, "role": request.role.upper()}


@app.get("/farmer/dashboard")
def farmer_dashboard(user=Depends(require_roles("FARMER", "FPO"))):
    return get_farmer_dashboard(user)


@app.patch("/farmer/profile")
def farmer_profile_update(request: FarmerProfileUpdate, user=Depends(require_roles("FARMER", "FPO"))):
    return {"profile": update_farmer_profile(request, user)}


@app.post("/farmer/listings", status_code=201)
def farmer_listing_create(request: ListingCreate, user=Depends(require_roles("FARMER", "FPO"))):
    return create_listing(request, user)


@app.patch("/farmer/listings/{listing_id}")
def farmer_listing_update(
    listing_id: int,
    request: ListingUpdate,
    user=Depends(require_roles("FARMER", "FPO")),
):
    return update_listing(listing_id, request, user)


@app.delete("/farmer/listings/{listing_id}")
def farmer_listing_delete(listing_id: int, user=Depends(require_roles("FARMER", "FPO"))):
    return cancel_listing(listing_id, user)


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
    query = ", ".join(value.strip() for value in (address, pincode, district, state, "India") if value and value.strip())
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
    try:
        result = location_distance(latitude1, longitude1, latitude2, longitude2)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return {
        "latitude1": latitude1,
        "longitude1": longitude1,
        "latitude2": latitude2,
        "longitude2": longitude2,
        **result,
        "distance_miles": round(result["straight_line_distance_km"] * 0.621371, 1),
    }


@app.get("/location/route")
def calculate_location_route(latitude1: float, longitude1: float, latitude2: float, longitude2: float):
    try:
        return location_distance(latitude1, longitude1, latitude2, longitude2)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.get("/markets")
def get_markets(crop: str | None = None):
    result = market_data_service.getMarketPrices(crop=crop)
    return {"markets": result["records"], **{key: value for key, value in result.items() if key != "records"}}


@app.get("/markets/crop-prices")
def get_crop_prices(crop: str, state: str | None = None):
    return market_data_service.getCropPrices(crop, state=state)


@app.get("/markets/history")
def get_market_history(crop: str | None = None, market: str | None = None):
    return market_data_service.getMarketHistory(crop=crop, market=market)


@app.get("/markets/arrivals")
def get_market_arrivals(crop: str | None = None, state: str | None = None):
    return market_data_service.getMarketArrivals(crop=crop, state=state)


@app.get("/markets/details")
def get_market_details(market: str, state: str | None = None):
    return market_data_service.getMarketDetails(market, state=state)


@app.get("/buyer/listings")
def buyer_listings(
    query: str | None = None,
    crop: str | None = None,
    location: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    min_quantity: float | None = None,
    max_quantity: float | None = None,
    quality: str | None = None,
    harvest_from: date | None = None,
    harvest_to: date | None = None,
    max_distance_km: float | None = None,
    availability: str = "ACTIVE",
    latitude: float | None = None,
    longitude: float | None = None,
    page: int = 1,
    page_size: int = 20,
    user=Depends(require_roles("BUYER")),
):
    return search_listings(
        query=query, crop=crop, location=location, min_price=min_price, max_price=max_price,
        min_quantity=min_quantity, max_quantity=max_quantity, quality=quality,
        harvest_from=harvest_from, harvest_to=harvest_to, max_distance_km=max_distance_km,
        availability=availability, latitude=latitude, longitude=longitude,
        page=page, page_size=page_size, user=user,
    )


@app.get("/buyer/listings/{listing_id}")
def buyer_listing_details(listing_id: int, user=Depends(require_roles("BUYER"))):
    return get_listing(listing_id, user)


@app.post("/buyer/listings/{listing_id}/offers", status_code=201)
def buyer_make_offer(listing_id: int, request: OfferCreate, user=Depends(require_roles("BUYER"))):
    return create_offer(listing_id, request, user)


@app.post("/buyer/listings/{listing_id}/orders", status_code=201)
def buyer_create_order(listing_id: int, request: OrderCreate, user=Depends(require_roles("BUYER"))):
    return create_order(listing_id, request, user)


@app.get("/buyer/orders")
def buyer_orders(user=Depends(require_roles("BUYER"))):
    return {"items": list_orders(user)}


@app.get("/buyer/orders/{order_id}/tracking")
def buyer_order_tracking(order_id: int, user=Depends(require_roles("BUYER"))):
    return get_order_tracking(order_id, user)


@app.post("/buyer/orders/{order_id}/reviews", status_code=201)
def buyer_review_order(order_id: int, request: ReviewCreate, user=Depends(require_roles("BUYER"))):
    return create_review(order_id, request, user)


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

    try:
        comparisons = compare_markets(matching_markets, quantity)
    except CostConfigurationError as error:
        raise HTTPException(
            status_code=503,
            detail="Net realization cost inputs are not configured. Configure transport, storage, platform, and other costs before comparing markets.",
        ) from error
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    results = []
    for market in comparisons:
        results.append({
            "market": market["name"],
            "location": market["location"],
            "price_per_kg": market["price_per_kg"],
            "crop": market["crop"],
            "minimum_price": market["minimum_price"],
            "maximum_price": market["maximum_price"],
            "modal_price": market["modal_price"],
            "unit": market["unit"],
            "last_updated": market["last_updated"],
            "source": market["source"],
            "data_state": market["data_state"],
            "distance_km": market["distance_km"],
            "straight_line_distance_km": market["straight_line_distance_km"],
            "road_distance_km": market["road_distance_km"],
            "distance_type": market["distance_type"],
            "directions_url": market.get("directions_url"),
            "estimated_transport_cost": market["transport_cost"],
            "storage_cost": market["storage_cost"],
            "platform_fee": market["platform_fee"],
            "other_cost": market["other_cost"],
            "gross_income": market["gross_income"],
            "net_return": market["net_realization"],
            "net_realization": market["net_realization"],
            "calculation_state": market["calculation_state"],
            "comparison_explanation": market["comparison_explanation"],
            "cost_inputs": market["cost_inputs"],
            "arrival_quantity": market.get("arrival_quantity"),
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

    results.sort(key=lambda market: market["net_realization"], reverse=True)

    best_market = results[0]
    best_market["smart_market_explanation"] = best_market["comparison_explanation"]

    data_state = matching_markets[0].get("data_state", "live") if matching_markets else "unavailable"
    history = market_data_service.getMarketHistory(crop=crop)
    intelligence = ai_service.analyze_market_data({
        "crop": request.crop,
        "farmer_location": request.location,
        "markets": results,
        "historical_prices": history["records"],
        "data_state": data_state,
        "demand": None,
        "seasonal": None,
    })

    return {
        "success": True,
        "crop": request.crop,
        "quantity_kg": quantity,
        "farmer_location": request.location,
        "source": matching_markets[0].get("source") if matching_markets else None,
        "data_state": data_state,
        "recommended_market": best_market,
        "all_markets": results,
        "intelligence": intelligence,
    }