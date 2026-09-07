from datetime import date
from typing import Any, Literal

from fastapi import Depends, HTTPException, Query
from pydantic import BaseModel, Field
from psycopg2.extras import Json

from auth import require_roles
from database import get_db_connection

FarmerUser = Depends(require_roles("FARMER", "FPO"))
BuyerUser = Depends(require_roles("BUYER"))
AdminUser = Depends(require_roles("ADMIN"))
Participant = Depends(require_roles("FARMER", "FPO", "BUYER", "ADMIN"))


class VerificationDocumentCreate(BaseModel):
    document_type: str = Field(min_length=2, max_length=80)
    document_reference: str | None = Field(default=None, max_length=160)
    document_url: str | None = Field(default=None, max_length=500)


class VerificationDecision(BaseModel):
    status: Literal["APPROVED", "REJECTED"]
    review_note: str | None = Field(default=None, max_length=500)


class PooledLotCreate(BaseModel):
    fpo_id: int
    commodity_name: str = Field(min_length=1, max_length=120)
    target_price_per_kg: float | None = Field(default=None, ge=0)
    quality_grade: str | None = Field(default=None, max_length=30)
    members: list[dict[str, Any]] = Field(min_length=1)


class AlertCreate(BaseModel):
    commodity_name: str | None = Field(default=None, max_length=120)
    market_name: str | None = Field(default=None, max_length=160)
    target_price_per_kg: float | None = Field(default=None, ge=0)
    alert_type: Literal["PRICE_TARGET", "RECOMMENDATION_CHANGE", "DEMAND_MATCH", "OFFER_RECEIVED"]


def submit_verification(payload: VerificationDocumentCreate, user=BuyerUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO buyer_verification_documents (buyer_user_id, document_type, document_reference, document_url) VALUES (%s, %s, %s, %s) RETURNING id", (user["id"], payload.document_type, payload.document_reference, payload.document_url))
            document_id = cursor.fetchone()[0]
            cursor.execute("UPDATE buyers SET verification_status = 'PENDING', updated_at = NOW() WHERE user_id = %s", (user["id"],))
        connection.commit()
    return {"id": document_id, "status": "PENDING"}


def review_verification(document_id: int, payload: VerificationDecision, user=AdminUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT buyer_user_id FROM buyer_verification_documents WHERE id = %s FOR UPDATE", (document_id,))
            document = cursor.fetchone()
            if not document:
                raise HTTPException(status_code=404, detail="Verification document not found")
            cursor.execute("UPDATE buyer_verification_documents SET status = %s, reviewed_by = %s, reviewed_at = NOW(), review_note = %s WHERE id = %s", (payload.status, user["id"], payload.review_note, document_id))
            cursor.execute("UPDATE buyers SET verification_status = %s, verification_notes = %s, updated_at = NOW() WHERE user_id = %s", (payload.status, payload.review_note, document[0]))
        connection.commit()
    return {"id": document_id, "status": payload.status, "buyer_user_id": str(document[0])}


def create_pooled_lot(payload: PooledLotCreate, user=FarmerUser):
    total = sum(float(member.get("quantity_kg", 0)) for member in payload.members)
    if total <= 0:
        raise HTTPException(status_code=422, detail="Pooled lot quantity must be positive")
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM fpo_members WHERE fpo_id = %s AND farmer_user_id = %s", (payload.fpo_id, user["id"]))
            if not cursor.fetchone():
                raise HTTPException(status_code=403, detail="You are not a member of this FPO")
            cursor.execute("INSERT INTO commodities (name) VALUES (%s) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id", (payload.commodity_name.strip(),))
            commodity_id = cursor.fetchone()[0]
            cursor.execute("INSERT INTO pooled_lots (fpo_id, commodity_id, total_quantity_kg, target_price_per_kg, quality_grade) VALUES (%s, %s, %s, %s, %s) RETURNING id", (payload.fpo_id, commodity_id, total, payload.target_price_per_kg, payload.quality_grade))
            lot_id = cursor.fetchone()[0]
            for member in payload.members:
                farmer_id = member.get("farmer_user_id")
                listing_id = member.get("listing_id")
                quantity = float(member.get("quantity_kg", 0))
                if not farmer_id or quantity <= 0:
                    raise HTTPException(status_code=422, detail="Each lot member needs farmer_user_id and quantity_kg")
                cursor.execute("SELECT 1 FROM fpo_members WHERE fpo_id = %s AND farmer_user_id = %s", (payload.fpo_id, farmer_id))
                if not cursor.fetchone():
                    raise HTTPException(status_code=422, detail="Every lot member must belong to the FPO")
                cursor.execute("INSERT INTO pooled_lot_members (lot_id, farmer_user_id, listing_id, quantity_kg) VALUES (%s, %s, %s, %s)", (lot_id, farmer_id, listing_id, quantity))
        connection.commit()
    return {"id": lot_id, "total_quantity_kg": total, "status": "OPEN"}


def list_pooled_lots(fpo_id: int | None = Query(default=None), user=Participant):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("""SELECT lots.id, fpos.name, commodities.name, lots.total_quantity_kg, lots.target_price_per_kg,
                lots.quality_grade, lots.status, lots.created_at
                FROM pooled_lots lots JOIN fpos ON fpos.id = lots.fpo_id JOIN commodities ON commodities.id = lots.commodity_id
                WHERE (%s IS NULL OR lots.fpo_id = %s) ORDER BY lots.created_at DESC LIMIT 100""", (fpo_id, fpo_id))
            return [{"id": row[0], "fpo_name": row[1], "commodity": row[2], "total_quantity_kg": float(row[3]), "target_price_per_kg": float(row[4]) if row[4] is not None else None, "quality_grade": row[5], "status": row[6], "created_at": row[7].isoformat()} for row in cursor.fetchall()]


def match_demands(user=Participant, commodity: str | None = None):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("""SELECT demands.id, commodities.name, demands.quantity_kg, demands.target_price_per_kg,
                demands.quality_requirements, demands.delivery_location, users.full_name
                FROM buyer_demands demands JOIN commodities ON commodities.id = demands.commodity_id
                JOIN users ON users.id = demands.buyer_user_id
                WHERE demands.status = 'OPEN' AND (%s IS NULL OR commodities.name ILIKE %s)
                ORDER BY demands.created_at DESC LIMIT 100""", (commodity, f"%{commodity}%" if commodity else None))
            demands = cursor.fetchall()
            results = []
            for demand in demands:
                cursor.execute("""SELECT listings.id, listings.quantity_value, listings.unit, listings.expected_price_per_unit,
                    listings.quality_details, users.full_name
                    FROM crop_listings listings JOIN commodities ON commodities.id = listings.commodity_id
                    JOIN users ON users.id = listings.farmer_user_id
                    WHERE listings.status IN ('ACTIVE', 'PUBLISHED') AND commodities.name = %s
                    ORDER BY listings.created_at DESC LIMIT 20""", (demand[1],))
                results.append({"demand": {"id": demand[0], "commodity": demand[1], "quantity_kg": float(demand[2]), "target_price_per_kg": float(demand[3]) if demand[3] is not None else None, "quality_requirements": demand[4], "delivery_location": demand[5], "buyer_name": demand[6]}, "matching_listings": [{"id": row[0], "quantity": float(row[1]), "unit": row[2], "expected_price": float(row[3]) if row[3] is not None else None, "quality": row[4], "farmer_name": row[5]} for row in cursor.fetchall()]})
            return results


def create_market_alert(payload: AlertCreate, user=Participant):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            commodity_id = None
            if payload.commodity_name:
                cursor.execute("INSERT INTO commodities (name) VALUES (%s) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id", (payload.commodity_name.strip(),))
                commodity_id = cursor.fetchone()[0]
            cursor.execute("INSERT INTO market_alerts (user_id, commodity_id, market_name, target_price_per_kg, alert_type) VALUES (%s, %s, %s, %s, %s) RETURNING id", (user["id"], commodity_id, payload.market_name, payload.target_price_per_kg, payload.alert_type))
            alert_id = cursor.fetchone()[0]
        connection.commit()
    return {"id": alert_id, "status": "ACTIVE"}


def list_market_alerts(user=Participant):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("""SELECT alerts.id, commodities.name, alerts.market_name, alerts.target_price_per_kg,
                alerts.alert_type, alerts.is_active, alerts.last_triggered_at, alerts.created_at
                FROM market_alerts alerts LEFT JOIN commodities ON commodities.id = alerts.commodity_id
                WHERE alerts.user_id = %s ORDER BY alerts.created_at DESC""", (user["id"],))
            return [{"id": row[0], "commodity": row[1], "market_name": row[2], "target_price_per_kg": float(row[3]) if row[3] is not None else None, "alert_type": row[4], "is_active": row[5], "last_triggered_at": row[6].isoformat() if row[6] else None, "created_at": row[7].isoformat()} for row in cursor.fetchall()]
