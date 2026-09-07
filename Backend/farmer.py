from datetime import date
from typing import Literal

from fastapi import Depends, HTTPException
from pydantic import BaseModel, Field
from psycopg2.extras import Json

from auth import require_roles
from database import get_db_connection


FarmerUser = Depends(require_roles("FARMER", "FPO"))
ListingUnit = Literal["kg", "quintal", "tonne", "piece", "crate"]
ListingStatus = Literal["DRAFT", "ACTIVE", "OFFER_RECEIVED", "ORDERED", "SOLD", "EXPIRED", "CANCELLED"]


class FarmerProfileUpdate(BaseModel):
    farm_name: str | None = None
    land_area_acres: float | None = Field(default=None, ge=0)
    farming_details: str | None = None
    village: str | None = None
    district: str | None = None
    state: str | None = None
    pincode: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)


class ListingCreate(BaseModel):
    commodity_name: str = Field(min_length=1, max_length=120)
    variety: str | None = Field(default=None, max_length=120)
    quantity: float = Field(gt=0)
    unit: ListingUnit
    expected_harvest_date: date | None = None
    quality_details: str | None = Field(default=None, max_length=500)
    expected_price: float | None = Field(default=None, ge=0)
    preferred_market_id: int | None = None
    preferred_market_name: str | None = Field(default=None, max_length=160)
    image_urls: list[str] = Field(default_factory=list, max_length=8)


class ListingUpdate(BaseModel):
    variety: str | None = Field(default=None, max_length=120)
    quantity: float | None = Field(default=None, gt=0)
    unit: ListingUnit | None = None
    expected_harvest_date: date | None = None
    quality_details: str | None = Field(default=None, max_length=500)
    expected_price: float | None = Field(default=None, ge=0)
    preferred_market_id: int | None = None
    preferred_market_name: str | None = Field(default=None, max_length=160)
    image_urls: list[str] | None = Field(default=None, max_length=8)
    status: ListingStatus | None = None


def _listing(row):
    return {
        "id": row[0],
        "commodity": row[1],
        "variety": row[2],
        "quantity": float(row[3]),
        "unit": row[4],
        "expected_harvest_date": row[5].isoformat() if row[5] else None,
        "quality_details": row[6],
        "expected_price": float(row[7]) if row[7] is not None else None,
        "preferred_market": row[8],
        "image_urls": row[9] or [],
        "status": row[10],
        "buyer_interest_count": row[11],
        "created_at": row[12].isoformat() if row[12] else None,
        "updated_at": row[13].isoformat() if row[13] else None,
    }


def get_farmer_dashboard(user=FarmerUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT users.id, users.full_name, users.email, users.phone,
                       farmers.farm_name, farmers.land_area_acres, farmers.farming_details,
                       locations.village, locations.district, locations.state, locations.pincode,
                       locations.latitude, locations.longitude,
                       COALESCE(json_agg(DISTINCT jsonb_build_object('id', fpos.id, 'name', fpos.name))
                           FILTER (WHERE fpos.id IS NOT NULL), '[]'::json)
                FROM users
                JOIN farmers ON farmers.user_id = users.id
                LEFT JOIN locations ON locations.id = farmers.location_id
                LEFT JOIN fpo_members ON fpo_members.farmer_user_id = farmers.user_id
                LEFT JOIN fpos ON fpos.id = fpo_members.fpo_id
                WHERE users.id = %s
                GROUP BY users.id, farmers.user_id, locations.id
                """,
                (user["id"],),
            )
            profile = cursor.fetchone()
            if not profile:
                raise HTTPException(status_code=404, detail="Farmer profile not found")

            cursor.execute(
                """
                SELECT listings.id, commodities.name, listings.variety, listings.quantity_value,
                       listings.unit, listings.harvest_date, listings.quality_details,
                       listings.expected_price_per_unit, COALESCE(markets.name, listings.preferred_market_name), listings.images,
                       listings.status, COUNT(offers.id), listings.created_at, listings.updated_at
                FROM crop_listings listings
                JOIN commodities ON commodities.id = listings.commodity_id
                LEFT JOIN markets ON markets.id = listings.preferred_market_id
                LEFT JOIN offers ON offers.listing_id = listings.id
                WHERE listings.farmer_user_id = %s
                GROUP BY listings.id, commodities.name, markets.name
                ORDER BY listings.updated_at DESC
                """,
                (user["id"],),
            )
            listings = [_listing(row) for row in cursor.fetchall()]

            cursor.execute(
                """
                SELECT offers.id, offers.listing_id, commodities.name, users.full_name,
                       offers.quantity_kg, offers.offered_price_per_kg, offers.status, offers.created_at
                FROM offers
                JOIN crop_listings ON crop_listings.id = offers.listing_id
                JOIN commodities ON commodities.id = crop_listings.commodity_id
                JOIN users ON users.id = offers.buyer_user_id
                WHERE crop_listings.farmer_user_id = %s
                ORDER BY offers.created_at DESC
                """,
                (user["id"],),
            )
            offers = [
                {
                    "id": row[0], "listing_id": row[1], "commodity": row[2], "buyer_name": row[3],
                    "quantity": float(row[4]), "offered_price_per_kg": float(row[5]),
                    "status": row[6], "created_at": row[7].isoformat(),
                }
                for row in cursor.fetchall()
            ]

            cursor.execute(
                """
                SELECT orders.id, orders.listing_id, orders.quantity_kg,
                       orders.agreed_price_per_kg, orders.status, orders.created_at,
                       payments.status, shipments.status
                FROM orders
                LEFT JOIN payments ON payments.order_id = orders.id
                LEFT JOIN shipments ON shipments.order_id = orders.id
                WHERE orders.farmer_user_id = %s
                ORDER BY orders.created_at DESC
                """,
                (user["id"],),
            )
            orders = [
                {
                    "id": row[0], "listing_id": row[1], "quantity": float(row[2]),
                    "agreed_price_per_kg": float(row[3]), "status": row[4],
                    "created_at": row[5].isoformat(), "payment_status": row[6],
                    "shipment_status": row[7],
                }
                for row in cursor.fetchall()
            ]

            cursor.execute(
                """
                SELECT payments.id, payments.order_id, payments.amount, payments.currency,
                       payments.status, payments.created_at
                FROM payments JOIN orders ON orders.id = payments.order_id
                WHERE orders.farmer_user_id = %s ORDER BY payments.created_at DESC
                """,
                (user["id"],),
            )
            payments = [
                {"id": row[0], "order_id": row[1], "amount": float(row[2]), "currency": row[3],
                 "status": row[4], "created_at": row[5].isoformat()}
                for row in cursor.fetchall()
            ]

            cursor.execute(
                """
                SELECT shipments.id, shipments.order_id, shipments.status,
                       shipments.scheduled_pickup_at, shipments.last_latitude,
                       shipments.last_longitude, shipments.last_location_at
                FROM shipments JOIN orders ON orders.id = shipments.order_id
                WHERE orders.farmer_user_id = %s ORDER BY shipments.created_at DESC
                """,
                (user["id"],),
            )
            logistics = [
                {"id": row[0], "order_id": row[1], "status": row[2],
                 "scheduled_pickup_at": row[3].isoformat() if row[3] else None,
                 "last_latitude": float(row[4]) if row[4] is not None else None,
                 "last_longitude": float(row[5]) if row[5] is not None else None,
                 "last_location_at": row[6].isoformat() if row[6] else None}
                for row in cursor.fetchall()
            ]

            cursor.execute(
                """
                SELECT reviews.id, reviews.order_id, users.full_name, reviews.rating,
                       reviews.comment, reviews.created_at
                FROM reviews JOIN users ON users.id = reviews.reviewer_user_id
                WHERE reviews.reviewee_user_id = %s ORDER BY reviews.created_at DESC
                """,
                (user["id"],),
            )
            reviews = [
                {"id": row[0], "order_id": row[1], "reviewer_name": row[2], "rating": row[3],
                 "comment": row[4], "created_at": row[5].isoformat()}
                for row in cursor.fetchall()
            ]

            cursor.execute(
                """
                SELECT id, notification_type, title, message, is_read, created_at
                FROM notifications WHERE user_id = %s ORDER BY created_at DESC LIMIT 50
                """,
                (user["id"],),
            )
            notifications = [
                {"id": row[0], "type": row[1], "title": row[2], "message": row[3],
                 "is_read": row[4], "created_at": row[5].isoformat()}
                for row in cursor.fetchall()
            ]

    return {
        "profile": {
            "user_id": str(profile[0]), "name": profile[1], "email": profile[2], "phone": profile[3],
            "farm_name": profile[4], "land_area_acres": float(profile[5]) if profile[5] is not None else None,
            "farming_details": profile[6], "location": {
                "village": profile[7], "district": profile[8], "state": profile[9], "pincode": profile[10],
                "latitude": float(profile[11]) if profile[11] is not None else None,
                "longitude": float(profile[12]) if profile[12] is not None else None,
            }, "fpos": profile[13],
        },
        "listings": listings, "offers": offers, "orders": orders, "payments": payments,
        "logistics": logistics, "reviews": reviews, "notifications": notifications,
    }


def update_farmer_profile(payload: FarmerProfileUpdate, user=FarmerUser):
    values = payload.model_dump(exclude_unset=True)
    location_fields = {key: values.pop(key) for key in list(values) if key in {"village", "district", "state", "pincode", "latitude", "longitude"}}
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            if location_fields:
                cursor.execute("SELECT location_id FROM farmers WHERE user_id = %s", (user["id"],))
                location_id = cursor.fetchone()[0]
                location_values = (
                    location_fields.get("village"), location_fields.get("district"), location_fields.get("state"),
                    location_fields.get("pincode"), location_fields.get("latitude"), location_fields.get("longitude"),
                )
                if location_id:
                    cursor.execute(
                        """UPDATE locations SET village = COALESCE(%s, village), district = COALESCE(%s, district),
                        state = COALESCE(%s, state), pincode = COALESCE(%s, pincode), latitude = COALESCE(%s, latitude),
                        longitude = COALESCE(%s, longitude) WHERE id = %s""",
                        (*location_values, location_id),
                    )
                else:
                    cursor.execute(
                        """INSERT INTO locations (village, district, state, pincode, latitude, longitude)
                        VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
                        location_values,
                    )
                    location_id = cursor.fetchone()[0]
                values["location_id"] = location_id
            if values:
                assignments = ", ".join(f"{key} = %s" for key in values)
                cursor.execute(
                    f"UPDATE farmers SET {assignments}, updated_at = NOW() WHERE user_id = %s",
                    (*values.values(), user["id"]),
                )
        connection.commit()
    return get_farmer_dashboard(user)["profile"]


def create_listing(payload: ListingCreate, user=FarmerUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """INSERT INTO commodities (name) VALUES (%s)
                ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id""",
                (payload.commodity_name.strip(),),
            )
            commodity_id = cursor.fetchone()[0]
            cursor.execute(
                """INSERT INTO crop_listings
                (farmer_user_id, commodity_id, variety, quantity_value, quantity_kg, unit, harvest_date,
                 quality_details, expected_price_per_unit, preferred_market_id, preferred_market_name, images)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id""",
                (user["id"], commodity_id, payload.variety, payload.quantity, payload.quantity, payload.unit,
                 payload.expected_harvest_date, payload.quality_details, payload.expected_price,
                 payload.preferred_market_id, payload.preferred_market_name, Json(payload.image_urls)),
            )
            listing_id = cursor.fetchone()[0]
        connection.commit()
    return {"id": listing_id, "status": "DRAFT"}


def update_listing(listing_id: int, payload: ListingUpdate, user=FarmerUser):
    values = payload.model_dump(exclude_unset=True)
    if not values:
        raise HTTPException(status_code=400, detail="No listing changes supplied")
    if "status" in values and values["status"] not in {"DRAFT", "ACTIVE"}:
        raise HTTPException(status_code=400, detail="Order and sale statuses are set by transaction workflows")
    if "image_urls" in values:
        values["images"] = Json(values.pop("image_urls"))
    if "expected_harvest_date" in values:
        values["harvest_date"] = values.pop("expected_harvest_date")
    if "expected_price" in values:
        values["expected_price_per_unit"] = values.pop("expected_price")
    if "quantity" in values:
        values["quantity_value"] = values.pop("quantity")
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            assignments = ", ".join(f"{key} = %s" for key in values)
            cursor.execute(
                f"UPDATE crop_listings SET {assignments}, updated_at = NOW() WHERE id = %s AND farmer_user_id = %s RETURNING id, status",
                (*values.values(), listing_id, user["id"]),
            )
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Listing not found")
        connection.commit()
    return {"id": row[0], "status": row[1]}


def cancel_listing(listing_id: int, user=FarmerUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """UPDATE crop_listings SET status = 'CANCELLED', updated_at = NOW()
                WHERE id = %s AND farmer_user_id = %s AND status NOT IN ('SOLD', 'ORDERED')
                RETURNING id""",
                (listing_id, user["id"]),
            )
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Listing not found or cannot be cancelled")
        connection.commit()
    return {"id": listing_id, "status": "CANCELLED"}
