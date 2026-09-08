from datetime import datetime, timezone
from collections import defaultdict
from typing import Any, Literal

from fastapi import Depends, HTTPException, Path, Query
from pydantic import BaseModel, Field, field_validator
from psycopg2.extras import Json

from auth import require_roles
from database import get_db_connection


FpoUser = Depends(require_roles("FPO"))
FarmerUser = Depends(require_roles("FARMER"))
BuyerUser = Depends(require_roles("BUYER"))
Participant = Depends(require_roles("FARMER", "FPO", "BUYER", "ADMIN"))


class MemberCreate(BaseModel):
    farmer_user_id: str


class MemberContribution(BaseModel):
    farmer_user_id: str
    listing_id: int = Field(gt=0)
    quantity_kg: float = Field(gt=0, allow_inf_nan=False)


class PooledLotCreateRequest(BaseModel):
    commodity_name: str = Field(min_length=1, max_length=120)
    target_price_per_kg: float | None = Field(default=None, ge=0)
    quality_standard: str = Field(min_length=2, max_length=120)
    quality_notes: str | None = Field(default=None, max_length=1000)
    members: list[MemberContribution] = Field(min_length=1)


class QualityReviewRequest(BaseModel):
    quality_grade: str = Field(min_length=1, max_length=40)
    quality_standard: str = Field(min_length=2, max_length=120)
    notes: str | None = Field(default=None, max_length=1000)


class BulkOfferRequest(BaseModel):
    offered_price_per_kg: float = Field(gt=0)
    expires_at: datetime | None = None

    @field_validator("expires_at")
    @classmethod
    def validate_expiry(cls, value):
        if value and value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        if value and value <= datetime.now(timezone.utc):
            raise ValueError("Offer expiry must be in the future")
        return value


class BulkOfferDecision(BaseModel):
    status: Literal["ACCEPTED", "REJECTED"]


def _owned_fpo(cursor, fpo_id: int, user_id: str) -> None:
    cursor.execute("SELECT 1 FROM fpos WHERE id = %s AND owner_user_id = %s", (fpo_id, user_id))
    if not cursor.fetchone():
        raise HTTPException(status_code=403, detail="You do not manage this FPO")


def _member_fpo(cursor, fpo_id: int, farmer_user_id: str) -> bool:
    cursor.execute("SELECT 1 FROM fpo_members WHERE fpo_id = %s AND farmer_user_id = %s", (fpo_id, farmer_user_id))
    return bool(cursor.fetchone())


def create_fpo(payload: dict[str, str], user=FpoUser):
    name = (payload.get("name") or "").strip()
    if not name:
        raise HTTPException(status_code=422, detail="FPO name is required")
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO fpos (name, registration_number, owner_user_id) VALUES (%s, %s, %s) RETURNING id, name", (name, payload.get("registration_number"), user["id"]))
            row = cursor.fetchone()
        connection.commit()
    return {"id": row[0], "name": row[1], "owner_user_id": user["id"]}


def list_my_fpos(user=FpoUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, name, registration_number FROM fpos WHERE owner_user_id = %s ORDER BY name", (user["id"],))
            return [{"id": row[0], "name": row[1], "registration_number": row[2]} for row in cursor.fetchall()]


def claim_fpo(fpo_id: int = Path(ge=1), user=FpoUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("""UPDATE fpos SET owner_user_id = %s
                WHERE id = %s AND owner_user_id IS NULL RETURNING id, name""", (user["id"], fpo_id))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=409, detail="FPO is already managed or does not exist")
        connection.commit()
    return {"id": row[0], "name": row[1], "owner_user_id": user["id"]}


def list_available_farmers(user=FpoUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT users.id, users.full_name, users.email, users.phone FROM users JOIN farmers ON farmers.user_id = users.id ORDER BY users.full_name")
            return [{"farmer_user_id": str(row[0]), "farmer_name": row[1], "email": row[2], "phone": row[3]} for row in cursor.fetchall()]


def list_members(fpo_id: int = Path(ge=1), user=FpoUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            _owned_fpo(cursor, fpo_id, user["id"])
            cursor.execute("""SELECT fpo_members.farmer_user_id, users.full_name, users.email, users.phone, fpo_members.joined_at
                FROM fpo_members JOIN users ON users.id = fpo_members.farmer_user_id
                WHERE fpo_members.fpo_id = %s ORDER BY users.full_name""", (fpo_id,))
            return [{"farmer_user_id": str(row[0]), "farmer_name": row[1], "email": row[2], "phone": row[3], "joined_at": row[4].isoformat()} for row in cursor.fetchall()]


def add_member(payload: MemberCreate, fpo_id: int = Path(ge=1), user=FpoUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            _owned_fpo(cursor, fpo_id, user["id"])
            cursor.execute("SELECT 1 FROM farmers WHERE user_id = %s", (payload.farmer_user_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Farmer not found")
            cursor.execute("INSERT INTO fpo_members (fpo_id, farmer_user_id) VALUES (%s, %s) ON CONFLICT DO NOTHING", (fpo_id, payload.farmer_user_id))
        connection.commit()
    return {"fpo_id": fpo_id, "farmer_user_id": payload.farmer_user_id, "status": "ACTIVE"}


def remove_member(fpo_id: int = Path(ge=1), farmer_user_id: str = Path(...), user=FpoUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            _owned_fpo(cursor, fpo_id, user["id"])
            cursor.execute("DELETE FROM fpo_members WHERE fpo_id = %s AND farmer_user_id = %s RETURNING farmer_user_id", (fpo_id, farmer_user_id))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="FPO member not found")
        connection.commit()
    return {"fpo_id": fpo_id, "farmer_user_id": farmer_user_id, "status": "REMOVED"}


def list_farmer_memberships(user=FarmerUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("""SELECT fpos.id, fpos.name, fpos.registration_number, fpo_members.joined_at
                FROM fpo_members JOIN fpos ON fpos.id = fpo_members.fpo_id
                WHERE fpo_members.farmer_user_id = %s ORDER BY fpos.name""", (user["id"],))
            return [{"fpo_id": row[0], "fpo_name": row[1], "registration_number": row[2], "joined_at": row[3].isoformat()} for row in cursor.fetchall()]


def list_member_listings(farmer_user_id: str = Path(...), fpo_id: int = Path(..., ge=1), user=FpoUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            _owned_fpo(cursor, fpo_id, user["id"])
            if not _member_fpo(cursor, fpo_id, farmer_user_id):
                raise HTTPException(status_code=403, detail="Farmer is not an FPO member")
            cursor.execute("""SELECT listings.id, commodities.name, listings.variety, listings.quantity_value, listings.unit, listings.status
                FROM crop_listings listings JOIN commodities ON commodities.id = listings.commodity_id
                WHERE listings.farmer_user_id = %s AND listings.status IN ('ACTIVE', 'PUBLISHED', 'OFFER_RECEIVED')
                ORDER BY listings.updated_at DESC""", (farmer_user_id,))
            return [{"listing_id": row[0], "crop": row[1], "variety": row[2], "quantity": float(row[3]), "unit": row[4], "status": row[5]} for row in cursor.fetchall()]


def create_pooled_lot(payload: PooledLotCreateRequest, fpo_id: int = Path(ge=1), user=FpoUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            _owned_fpo(cursor, fpo_id, user["id"])
            cursor.execute("INSERT INTO commodities (name) VALUES (%s) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id", (payload.commodity_name.strip(),))
            commodity_id = cursor.fetchone()[0]
            total = 0.0
            checked_members = []
            for member in payload.members:
                farmer_id = member.farmer_user_id
                quantity = member.quantity_kg
                if not farmer_id or quantity <= 0 or not _member_fpo(cursor, fpo_id, farmer_id):
                    raise HTTPException(status_code=422, detail="Each member must be an active FPO member with positive quantity")
                if member.listing_id:
                    cursor.execute(
                        """SELECT farmer_user_id, commodity_id, quantity_value, status
                        FROM crop_listings WHERE id = %s""",
                        (member.listing_id,),
                    )
                    listing = cursor.fetchone()
                    if not listing or str(listing[0]) != str(farmer_id) or listing[1] != commodity_id or listing[3] not in {"ACTIVE", "PUBLISHED", "OFFER_RECEIVED"} or quantity > float(listing[2]):
                        raise HTTPException(status_code=422, detail="Each source listing must belong to its farmer, match the crop, and have sufficient available quantity")
                total += quantity
                checked_members.append((farmer_id, member.listing_id, quantity))
            cursor.execute("""INSERT INTO pooled_lots (fpo_id, commodity_id, total_quantity_kg, target_price_per_kg, quality_standard, quality_notes)
                VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""", (fpo_id, commodity_id, total, payload.target_price_per_kg, payload.quality_standard, payload.quality_notes))
            lot_id = cursor.fetchone()[0]
            for farmer_id, listing_id, quantity in checked_members:
                cursor.execute("INSERT INTO pooled_lot_members (lot_id, farmer_user_id, listing_id, quantity_kg) VALUES (%s, %s, %s, %s)", (lot_id, farmer_id, listing_id, quantity))
        connection.commit()
    return {"id": lot_id, "status": "OPEN", "total_quantity_kg": total}


def list_my_lots(user=FpoUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("""SELECT lots.id, fpos.name, commodities.name, lots.total_quantity_kg, lots.target_price_per_kg,
                lots.quality_standard, lots.quality_grade, lots.status, lots.created_at
                FROM pooled_lots lots JOIN fpos ON fpos.id = lots.fpo_id JOIN commodities ON commodities.id = lots.commodity_id
                WHERE fpos.owner_user_id = %s ORDER BY lots.created_at DESC""", (user["id"],))
            return [{"lot_id": row[0], "fpo_name": row[1], "commodity": row[2], "total_quantity_kg": float(row[3]), "target_price_per_kg": float(row[4]) if row[4] is not None else None, "quality_standard": row[5], "quality_grade": row[6], "status": row[7], "created_at": row[8].isoformat()} for row in cursor.fetchall()]


def review_quality(payload: QualityReviewRequest, lot_id: int = Path(ge=1), user=FpoUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT fpo_id FROM pooled_lots WHERE id = %s FOR UPDATE", (lot_id,))
            lot = cursor.fetchone()
            if not lot:
                raise HTTPException(status_code=404, detail="Pooled lot not found")
            _owned_fpo(cursor, lot[0], user["id"])
            cursor.execute("UPDATE pooled_lots SET quality_grade = %s, quality_standard = %s, quality_notes = %s, quality_standardized_by = %s, quality_standardized_at = NOW(), updated_at = NOW() WHERE id = %s", (payload.quality_grade, payload.quality_standard, payload.notes, user["id"], lot_id))
            cursor.execute("INSERT INTO pooled_lot_quality_reviews (pooled_lot_id, quality_grade, quality_standard, notes, reviewed_by) VALUES (%s, %s, %s, %s, %s) RETURNING id", (lot_id, payload.quality_grade, payload.quality_standard, payload.notes, user["id"]))
            review_id = cursor.fetchone()[0]
        connection.commit()
    return {"id": review_id, "lot_id": lot_id, "quality_grade": payload.quality_grade, "quality_standard": payload.quality_standard}


def list_lot_offers(lot_id: int = Path(ge=1), user=FpoUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT fpo_id FROM pooled_lots WHERE id = %s", (lot_id,))
            lot = cursor.fetchone()
            if not lot:
                raise HTTPException(status_code=404, detail="Pooled lot not found")
            _owned_fpo(cursor, lot[0], user["id"])
            cursor.execute("""SELECT offers.id, users.full_name, offers.quantity_kg, offers.offered_price_per_kg,
                offers.status, offers.expires_at, offers.created_at
                FROM offers JOIN buyers ON buyers.user_id = offers.buyer_user_id
                JOIN users ON users.id = buyers.user_id
                WHERE offers.pooled_lot_id = %s ORDER BY offers.created_at DESC""", (lot_id,))
            return [{"offer_id": row[0], "buyer_name": row[1], "quantity_kg": float(row[2]), "offered_price_per_kg": float(row[3]), "status": row[4], "expires_at": row[5].isoformat() if row[5] else None, "created_at": row[6].isoformat()} for row in cursor.fetchall()]


def decide_bulk_offer(payload: BulkOfferDecision, offer_id: int = Path(ge=1), user=FpoUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("""SELECT offers.pooled_lot_id, lots.fpo_id, offers.status, offers.expires_at
                FROM offers JOIN pooled_lots lots ON lots.id = offers.pooled_lot_id
                WHERE offers.id = %s FOR UPDATE""", (offer_id,))
            offer = cursor.fetchone()
            if not offer:
                raise HTTPException(status_code=404, detail="Bulk offer not found")
            _owned_fpo(cursor, offer[1], user["id"])
            if offer[2] != "PENDING":
                raise HTTPException(status_code=409, detail="Only pending bulk offers can be decided")
            if offer[3] and offer[3] <= datetime.now(timezone.utc):
                raise HTTPException(status_code=409, detail="Bulk offer has expired")
            cursor.execute("UPDATE offers SET status = %s, responded_at = NOW() WHERE id = %s", (payload.status, offer_id))
            if payload.status == "ACCEPTED":
                cursor.execute("UPDATE pooled_lots SET status = 'OFFERED', updated_at = NOW() WHERE id = %s", (offer[0],))
        connection.commit()
    return {"offer_id": offer_id, "status": payload.status}


def create_bulk_offer(payload: BulkOfferRequest, lot_id: int = Path(ge=1), user=BuyerUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT lots.fpo_id, lots.total_quantity_kg, lots.status, lots.commodity_id FROM pooled_lots lots WHERE lots.id = %s FOR UPDATE", (lot_id,))
            lot = cursor.fetchone()
            if not lot:
                raise HTTPException(status_code=404, detail="Pooled lot not found")
            if lot[2] not in {"OPEN", "OFFERED"}:
                raise HTTPException(status_code=409, detail="Pooled lot is not available for offers")
            cursor.execute("""INSERT INTO offers (listing_id, pooled_lot_id, buyer_user_id, quantity_kg, offered_price_per_kg, expires_at)
                VALUES (NULL, %s, %s, %s, %s, %s) RETURNING id""", (lot_id, user["id"], lot[1], payload.offered_price_per_kg, payload.expires_at))
            offer = cursor.fetchone()
        connection.commit()
    return {"id": offer[0], "lot_id": lot_id, "status": "PENDING"}


def calculate_settlements(offer_id: int = Path(ge=1), user=FpoUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("""SELECT offers.pooled_lot_id, offers.quantity_kg, offers.offered_price_per_kg, lots.fpo_id, offers.status, offers.expires_at
                FROM offers JOIN pooled_lots lots ON lots.id = offers.pooled_lot_id WHERE offers.id = %s""", (offer_id,))
            offer = cursor.fetchone()
            if not offer:
                raise HTTPException(status_code=404, detail="Bulk offer not found")
            _owned_fpo(cursor, offer[3], user["id"])
            if offer[5] and offer[5] <= datetime.now(timezone.utc):
                raise HTTPException(status_code=409, detail="Bulk offer has expired")
            if offer[4] not in {"PENDING", "ACCEPTED"}:
                raise HTTPException(status_code=409, detail="Rejected bulk offers cannot be settled")
            cursor.execute("""SELECT farmer_user_id, quantity_kg FROM pooled_lot_members WHERE lot_id = %s""", (offer[0],))
            members = cursor.fetchall()
            contributions = defaultdict(float)
            for farmer_id, quantity in members:
                contributions[farmer_id] += float(quantity)
            total = sum(contributions.values())
            if total <= 0:
                raise HTTPException(status_code=409, detail="Pooled lot has no member quantity")
            settlements = []
            for farmer_id, quantity in contributions.items():
                amount = float(offer[2]) * quantity
                cursor.execute("""INSERT INTO pooled_lot_settlements
                    (pooled_lot_id, offer_id, farmer_user_id, contributed_quantity_kg, total_lot_quantity_kg, settlement_amount, calculated_by)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (pooled_lot_id, offer_id, farmer_user_id) DO UPDATE SET settlement_amount = EXCLUDED.settlement_amount, calculated_at = NOW()
                    RETURNING farmer_user_id, contributed_quantity_kg, settlement_amount""", (offer[0], offer_id, farmer_id, quantity, total, amount, user["id"]))
                row = cursor.fetchone()
                settlements.append({"farmer_user_id": str(row[0]), "contributed_quantity_kg": float(row[1]), "settlement_amount": float(row[2])})
        connection.commit()
    return {"offer_id": offer_id, "lot_id": offer[0], "settlements": settlements}
