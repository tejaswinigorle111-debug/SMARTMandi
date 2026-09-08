from datetime import date, datetime, timezone
from typing import Literal

from fastapi import Depends, HTTPException, Query
from pydantic import BaseModel, Field

from auth import require_roles
from database import get_db_connection


BuyerUser = Depends(require_roles("BUYER"))


class OfferCreate(BaseModel):
    quantity: float = Field(gt=0)
    offered_price_per_kg: float = Field(gt=0)
    expires_at: datetime | None = None


class OrderCreate(BaseModel):
    quantity: float = Field(gt=0)
    agreed_price_per_kg: float = Field(gt=0)
    offer_id: int | None = None


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=1000)


class BuyerRegistrationRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=160)
    business_name: str = Field(min_length=1, max_length=200)
    buyer_type: Literal["Wholesaler", "Retailer", "Processor", "Exporter", "Other"]
    mobile_number: str = Field(min_length=10, max_length=20)
    email: str | None = Field(default=None, max_length=200)
    state: str = Field(min_length=1, max_length=120)
    district: str = Field(min_length=1, max_length=120)
    market_area: str = Field(min_length=1, max_length=200)
    business_address: str = Field(min_length=1, max_length=500)
    preferred_crops: list[str] = Field(min_length=1, max_length=36)
    min_quantity: float = Field(gt=0)
    max_quantity: float = Field(gt=0)
    quantity_unit: Literal["kg", "quintal", "tonne"]
    min_price: float = Field(ge=0)
    max_price: float = Field(ge=0)
    buying_frequency: Literal["Daily", "Weekly", "Monthly", "As Needed"]


def create_buyer_registration_request(payload: BuyerRegistrationRequest):
    if payload.max_quantity < payload.min_quantity:
        raise HTTPException(status_code=422, detail="Maximum quantity cannot be less than minimum quantity")
    if payload.max_price < payload.min_price:
        raise HTTPException(status_code=422, detail="Maximum price cannot be less than minimum price")

    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """INSERT INTO buyer_registration_requests
                (full_name, business_name, buyer_type, mobile_number, email, state, district,
                 market_area, business_address, preferred_crops, min_quantity, max_quantity,
                 quantity_unit, min_price, max_price, buying_frequency)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id, status, created_at""",
                (
                    payload.full_name.strip(), payload.business_name.strip(), payload.buyer_type,
                    payload.mobile_number.strip(), payload.email.strip() if payload.email else None,
                    payload.state.strip(), payload.district.strip(), payload.market_area.strip(),
                    payload.business_address.strip(), payload.preferred_crops, payload.min_quantity,
                    payload.max_quantity, payload.quantity_unit, payload.min_price, payload.max_price,
                    payload.buying_frequency,
                ),
            )
            request_id, status, created_at = cursor.fetchone()
        connection.commit()
    return {"id": request_id, "status": status, "created_at": created_at.isoformat()}


def _distance_expression(origin_latitude: float | None, origin_longitude: float | None) -> tuple[str, list[float]]:
    if origin_latitude is None or origin_longitude is None:
        return "NULL::double precision", []
    expression = (
        "6371.0 * acos(LEAST(1.0, GREATEST(-1.0, "
        "sin(radians(%s)) * sin(radians(loc.latitude)) + "
        "cos(radians(%s)) * cos(radians(loc.latitude)) * "
        "cos(radians(loc.longitude) - radians(%s)))))"
    )
    return expression, [origin_latitude, origin_latitude, origin_longitude]


def _listing_item(row):
    return {
        "id": row[0], "crop": row[1], "variety": row[2], "quantity": float(row[3]), "unit": row[4],
        "expected_harvest_date": row[5].isoformat() if row[5] else None, "quality": row[6],
        "expected_price": float(row[7]) if row[7] is not None else None, "preferred_market": row[8],
        "farmer_name": row[9], "fpo_name": row[10], "village": row[11], "district": row[12], "state": row[13],
        "distance_km": round(float(row[14]), 1) if row[14] is not None else None,
        "status": row[15], "created_at": row[16].isoformat() if row[16] else None,
    }


def search_listings(
    *,
    query: str | None = None,
    crop: str | None = None,
    location: str | None = None,
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    min_quantity: float | None = Query(default=None, ge=0),
    max_quantity: float | None = Query(default=None, ge=0),
    quality: str | None = None,
    harvest_from: date | None = None,
    harvest_to: date | None = None,
    max_distance_km: float | None = Query(default=None, gt=0),
    availability: Literal["ACTIVE", "OFFER_RECEIVED", "PUBLISHED"] = "ACTIVE",
    latitude: float | None = Query(default=None, ge=-90, le=90),
    longitude: float | None = Query(default=None, ge=-180, le=180),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    user=BuyerUser,
):
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(status_code=422, detail="Minimum price cannot exceed maximum price")
    if min_quantity is not None and max_quantity is not None and min_quantity > max_quantity:
        raise HTTPException(status_code=422, detail="Minimum quantity cannot exceed maximum quantity")
    if harvest_from and harvest_to and harvest_from > harvest_to:
        raise HTTPException(status_code=422, detail="Harvest start date cannot exceed end date")

    distance_sql, distance_params = _distance_expression(latitude, longitude)
    conditions = ["listings.status = %s"]
    filter_params: list[object] = [availability]
    if query:
        conditions.append("(commodities.name ILIKE %s OR listings.variety ILIKE %s OR locations.district ILIKE %s OR locations.state ILIKE %s)")
        value = f"%{query.strip()}%"
        filter_params.extend([value, value, value, value])
    if crop:
        conditions.append("commodities.name ILIKE %s")
        filter_params.append(f"%{crop.strip()}%")
    if location:
        conditions.append("(locations.district ILIKE %s OR locations.state ILIKE %s OR locations.village ILIKE %s)")
        value = f"%{location.strip()}%"
        filter_params.extend([value, value, value])
    if min_price is not None:
        conditions.append("listings.expected_price_per_unit >= %s")
        filter_params.append(min_price)
    if max_price is not None:
        conditions.append("listings.expected_price_per_unit <= %s")
        filter_params.append(max_price)
    if min_quantity is not None:
        conditions.append("listings.quantity_value >= %s")
        filter_params.append(min_quantity)
    if max_quantity is not None:
        conditions.append("listings.quantity_value <= %s")
        filter_params.append(max_quantity)
    if quality:
        conditions.append("listings.quality_details ILIKE %s")
        filter_params.append(f"%{quality.strip()}%")
    if harvest_from:
        conditions.append("listings.harvest_date >= %s")
        filter_params.append(harvest_from)
    if harvest_to:
        conditions.append("listings.harvest_date <= %s")
        filter_params.append(harvest_to)

    distance_filter = ""
    distance_filter_params: list[object] = []
    if max_distance_km is not None:
        distance_filter = " AND distance_km IS NOT NULL AND distance_km <= %s"
        distance_filter_params.append(max_distance_km)

    cte = f"""
        WITH listing_rows AS (
            SELECT listings.id, commodities.name, listings.variety, listings.quantity_value, listings.unit,
                   listings.harvest_date, listings.quality_details, listings.expected_price_per_unit,
                   COALESCE(markets.name, listings.preferred_market_name), farmer_users.full_name,
                   fpos.name, locations.village, locations.district, locations.state,
                   {distance_sql} AS distance_km, listings.status, listings.created_at
            FROM crop_listings listings
            JOIN commodities ON commodities.id = listings.commodity_id
            JOIN farmers ON farmers.user_id = listings.farmer_user_id
            JOIN users farmer_users ON farmer_users.id = farmers.user_id
            LEFT JOIN fpo_members ON fpo_members.farmer_user_id = farmers.user_id
            LEFT JOIN fpos ON fpos.id = fpo_members.fpo_id
            LEFT JOIN locations ON locations.id = listings.preferred_location_id
            LEFT JOIN markets ON markets.id = listings.preferred_market_id
            WHERE {' AND '.join(conditions)}
        )
    """
    base_params = distance_params + filter_params
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                cte + "SELECT COUNT(*) FROM listing_rows WHERE TRUE" + distance_filter,
                (*base_params, *distance_filter_params),
            )
            total = cursor.fetchone()[0]
            offset = (page - 1) * page_size
            cursor.execute(
                cte + "SELECT * FROM listing_rows WHERE TRUE" + distance_filter + " ORDER BY created_at DESC LIMIT %s OFFSET %s",
                (*base_params, *distance_filter_params, page_size, offset),
            )
            listings = [_listing_item(row) for row in cursor.fetchall()]

    return {"items": listings, "page": page, "page_size": page_size, "total": total, "has_next": offset + len(listings) < total}


def get_listing(listing_id: int, user=BuyerUser):
    result = search_listings(page=1, page_size=100, user=user)
    for listing in result["items"]:
        if listing["id"] == listing_id:
            return listing
    raise HTTPException(status_code=404, detail="Listing not found or unavailable")


def create_offer(listing_id: int, payload: OfferCreate, user=BuyerUser):
    if payload.expires_at and payload.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=422, detail="Offer expiry must be in the future")
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT farmer_user_id, quantity_value, status FROM crop_listings WHERE id = %s",
                (listing_id,),
            )
            listing = cursor.fetchone()
            if not listing or listing[2] not in {"ACTIVE", "OFFER_RECEIVED", "PUBLISHED"}:
                raise HTTPException(status_code=404, detail="Listing is not available")
            if payload.quantity > float(listing[1]):
                raise HTTPException(status_code=422, detail="Offer quantity exceeds listing quantity")
            cursor.execute(
                """INSERT INTO offers (listing_id, buyer_user_id, quantity_kg, offered_price_per_kg, expires_at)
                VALUES (%s, %s, %s, %s, %s) RETURNING id""",
                (listing_id, user["id"], payload.quantity, payload.offered_price_per_kg, payload.expires_at),
            )
            offer_id = cursor.fetchone()[0]
            cursor.execute(
                "UPDATE crop_listings SET status = 'OFFER_RECEIVED', updated_at = NOW() WHERE id = %s AND status IN ('ACTIVE', 'PUBLISHED')",
                (listing_id,),
            )
        connection.commit()
    return {"id": offer_id, "listing_id": listing_id, "status": "PENDING", "expires_at": payload.expires_at.isoformat() if payload.expires_at else None}


def create_order(listing_id: int, payload: OrderCreate, user=BuyerUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT farmer_user_id, quantity_value, status FROM crop_listings WHERE id = %s FOR UPDATE",
                (listing_id,),
            )
            listing = cursor.fetchone()
            if not listing or listing[2] not in {"ACTIVE", "OFFER_RECEIVED", "PUBLISHED"}:
                raise HTTPException(status_code=404, detail="Listing is not available for ordering")
            if payload.quantity > float(listing[1]):
                raise HTTPException(status_code=422, detail="Order quantity exceeds listing quantity")
            if payload.offer_id:
                cursor.execute("SELECT id FROM offers WHERE id = %s AND listing_id = %s AND buyer_user_id = %s", (payload.offer_id, listing_id, user["id"]))
                if not cursor.fetchone():
                    raise HTTPException(status_code=404, detail="Offer not found")
            cursor.execute(
                """INSERT INTO orders (listing_id, offer_id, farmer_user_id, buyer_user_id, quantity_kg, agreed_price_per_kg)
                VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
                (listing_id, payload.offer_id, listing[0], user["id"], payload.quantity, payload.agreed_price_per_kg),
            )
            order_id = cursor.fetchone()[0]
            cursor.execute(
                "INSERT INTO payments (order_id, amount) VALUES (%s, %s)",
                (order_id, payload.quantity * payload.agreed_price_per_kg),
            )
            cursor.execute("UPDATE crop_listings SET status = 'ORDERED', updated_at = NOW() WHERE id = %s", (listing_id,))
        connection.commit()
    return {"id": order_id, "status": "CREATED", "payment_status": "PENDING"}


def list_orders(user=BuyerUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """SELECT orders.id, orders.listing_id, commodities.name, orders.quantity_kg,
                orders.agreed_price_per_kg, orders.status, orders.created_at, payments.status, shipments.status
                FROM orders JOIN crop_listings ON crop_listings.id = orders.listing_id
                JOIN commodities ON commodities.id = crop_listings.commodity_id
                LEFT JOIN payments ON payments.order_id = orders.id
                LEFT JOIN shipments ON shipments.order_id = orders.id
                WHERE orders.buyer_user_id = %s ORDER BY orders.created_at DESC""",
                (user["id"],),
            )
            return [{"id": row[0], "listing_id": row[1], "crop": row[2], "quantity": float(row[3]), "agreed_price_per_kg": float(row[4]), "status": row[5], "created_at": row[6].isoformat(), "payment_status": row[7], "shipment_status": row[8]} for row in cursor.fetchall()]


def get_order_tracking(order_id: int, user=BuyerUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """SELECT shipments.id, shipments.status, shipments.scheduled_pickup_at,
                shipments.picked_up_at, shipments.delivered_at, shipments.last_latitude,
                shipments.last_longitude, shipments.last_location_at
                FROM shipments JOIN orders ON orders.id = shipments.order_id
                WHERE shipments.order_id = %s AND orders.buyer_user_id = %s""",
                (order_id, user["id"]),
            )
            row = cursor.fetchone()
            if not row:
                return {"order_id": order_id, "status": "No shipment assigned", "shipment": None}
            return {"order_id": order_id, "status": row[1], "shipment": {"id": row[0], "scheduled_pickup_at": row[2].isoformat() if row[2] else None, "picked_up_at": row[3].isoformat() if row[3] else None, "delivered_at": row[4].isoformat() if row[4] else None, "last_latitude": float(row[5]) if row[5] is not None else None, "last_longitude": float(row[6]) if row[6] is not None else None, "last_location_at": row[7].isoformat() if row[7] else None}}


def create_review(order_id: int, payload: ReviewCreate, user=BuyerUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT farmer_user_id, status FROM orders WHERE id = %s AND buyer_user_id = %s", (order_id, user["id"]))
            order = cursor.fetchone()
            if not order:
                raise HTTPException(status_code=404, detail="Order not found")
            if order[1] not in {"DELIVERED", "COMPLETED"}:
                raise HTTPException(status_code=409, detail="Reviews are available after delivery")
            cursor.execute("""INSERT INTO reviews (order_id, reviewer_user_id, reviewee_user_id, rating, comment)
            VALUES (%s, %s, %s, %s, %s) RETURNING id""", (order_id, user["id"], order[0], payload.rating, payload.comment))
            review_id = cursor.fetchone()[0]
        connection.commit()
    return {"id": review_id, "order_id": order_id, "rating": payload.rating}
