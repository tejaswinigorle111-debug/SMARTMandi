from datetime import date
from typing import Literal

from fastapi import Depends, HTTPException, Path
from pydantic import BaseModel, Field
from psycopg2.extras import Json

from auth import require_roles
from database import get_db_connection


FarmerUser = Depends(require_roles("FARMER", "FPO"))
LotUnit = Literal["kg", "quintal", "tonne", "piece", "crate"]
LotStatus = Literal["DRAFT", "ACTIVE", "OFFER_RECEIVED", "ORDERED", "SOLD", "EXPIRED", "CANCELLED", "PUBLISHED", "RESERVED"]


class CropLotCreate(BaseModel):
    commodity_name: str = Field(min_length=1, max_length=120)
    variety: str | None = Field(default=None, max_length=120)
    quantity: float = Field(gt=0)
    unit: LotUnit
    location: str = Field(min_length=1, max_length=240)
    harvest_date: date | None = None
    photos: list[str] = Field(default_factory=list, max_length=8)
    quality_grade: str | None = Field(default=None, max_length=40)
    quality_details: str | None = Field(default=None, max_length=500)
    expected_price: float | None = Field(default=None, ge=0)
    availability_date: date | None = None
    fpo_id: int | None = Field(default=None, gt=0)
    status: LotStatus = "DRAFT"


class CropLotUpdate(BaseModel):
    commodity_name: str | None = Field(default=None, min_length=1, max_length=120)
    variety: str | None = Field(default=None, max_length=120)
    quantity: float | None = Field(default=None, gt=0)
    unit: LotUnit | None = None
    location: str | None = Field(default=None, min_length=1, max_length=240)
    harvest_date: date | None = None
    photos: list[str] | None = Field(default=None, max_length=8)
    quality_grade: str | None = Field(default=None, max_length=40)
    quality_details: str | None = Field(default=None, max_length=500)
    expected_price: float | None = Field(default=None, ge=0)
    availability_date: date | None = None
    fpo_id: int | None = Field(default=None, gt=0)
    status: LotStatus | None = None


def _lot(row):
    return {
        "id": row[0],
        "lot_code": row[1],
        "qr_payload": f"smartmandi://lot/{row[1]}",
        "farmer_user_id": str(row[2]),
        "fpo_id": row[3],
        "crop": row[4],
        "variety": row[5],
        "quantity": float(row[6]),
        "unit": row[7],
        "location": row[8],
        "harvest_date": row[9].isoformat() if row[9] else None,
        "photos": row[10] or [],
        "quality_grade": row[11],
        "quality_details": row[12],
        "expected_price": float(row[13]) if row[13] is not None else None,
        "availability_date": row[14].isoformat() if row[14] else None,
        "status": row[15],
        "created_at": row[16].isoformat() if row[16] else None,
        "updated_at": row[17].isoformat() if row[17] else None,
    }


_SELECT = """
    SELECT listings.id, listings.lot_code, listings.farmer_user_id, listings.fpo_id,
           commodities.name, listings.variety, listings.quantity_value, listings.unit,
           COALESCE(locations.village, locations.district, locations.state),
           listings.harvest_date, listings.images, listings.quality_grade,
           listings.quality_details, listings.expected_price_per_unit,
           listings.availability_date, listings.status, listings.created_at, listings.updated_at
    FROM crop_listings listings
    JOIN commodities ON commodities.id = listings.commodity_id
    LEFT JOIN locations ON locations.id = listings.preferred_location_id
"""


def _location_id(cursor, location: str | None) -> int | None:
    if location is None:
        return None
    cursor.execute(
        """INSERT INTO locations (village) VALUES (%s) RETURNING id""",
        (location.strip(),),
    )
    return cursor.fetchone()[0]


def _verify_fpo(cursor, fpo_id: int | None, user_id: str) -> None:
    if fpo_id is None:
        return
    cursor.execute(
        "SELECT 1 FROM fpo_members WHERE fpo_id = %s AND farmer_user_id = %s",
        (fpo_id, user_id),
    )
    if not cursor.fetchone():
        raise HTTPException(status_code=403, detail="You are not a member of this FPO")


def create_crop_lot(payload: CropLotCreate, user=FarmerUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            _verify_fpo(cursor, payload.fpo_id, user["id"])
            cursor.execute(
                """INSERT INTO commodities (name) VALUES (%s)
                ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id""",
                (payload.commodity_name.strip(),),
            )
            commodity_id = cursor.fetchone()[0]
            location_id = _location_id(cursor, payload.location)
            cursor.execute(
                """INSERT INTO crop_listings
                (farmer_user_id, fpo_id, commodity_id, variety, quantity_value, quantity_kg, unit,
                 harvest_date, preferred_location_id, quality_grade, quality_details,
                 expected_price_per_unit, availability_date, images, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id""",
                (user["id"], payload.fpo_id, commodity_id, payload.variety, payload.quantity,
                 payload.quantity, payload.unit, payload.harvest_date, location_id,
                 payload.quality_grade, payload.quality_details, payload.expected_price,
                 payload.availability_date, Json(payload.photos), payload.status),
            )
            lot_id = cursor.fetchone()[0]
            lot_code = f"LOT-{lot_id:08d}"
            cursor.execute(
                "UPDATE crop_listings SET lot_code = %s WHERE id = %s",
                (lot_code, lot_id),
            )
        connection.commit()
    return {"id": lot_id, "lot_code": lot_code, "qr_payload": f"smartmandi://lot/{lot_code}", "status": payload.status}


def list_crop_lots(user=FarmerUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(_SELECT + " WHERE listings.farmer_user_id = %s ORDER BY listings.updated_at DESC", (user["id"],))
            return [_lot(row) for row in cursor.fetchall()]


def get_crop_lot(lot_id: int = Path(ge=1), user=FarmerUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(_SELECT + " WHERE listings.id = %s AND listings.lot_code IS NOT NULL AND listings.farmer_user_id = %s", (lot_id, user["id"]))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Crop lot not found")
            return _lot(row)


def update_crop_lot(payload: CropLotUpdate, lot_id: int = Path(ge=1), user=FarmerUser):
    values = payload.model_dump(exclude_unset=True)
    if not values:
        raise HTTPException(status_code=400, detail="No crop-lot changes supplied")
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT fpo_id FROM crop_listings WHERE id = %s AND lot_code IS NOT NULL AND farmer_user_id = %s FOR UPDATE", (lot_id, user["id"]))
            current = cursor.fetchone()
            if not current:
                raise HTTPException(status_code=404, detail="Crop lot not found")
            if "fpo_id" in values:
                _verify_fpo(cursor, values["fpo_id"], user["id"])
            if "location" in values:
                values["preferred_location_id"] = _location_id(cursor, values.pop("location"))
            if "commodity_name" in values:
                cursor.execute(
                    """INSERT INTO commodities (name) VALUES (%s)
                    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id""",
                    (values.pop("commodity_name").strip(),),
                )
                values["commodity_id"] = cursor.fetchone()[0]
            mappings = {
                "photos": "images", "harvest_date": "harvest_date", "expected_price": "expected_price_per_unit",
                "quantity": "quantity_value",
            }
            values = {mappings.get(key, key): value for key, value in values.items()}
            if "quantity_value" in values:
                values["quantity_kg"] = values["quantity_value"]
            assignments = ", ".join(f"{key} = %s" for key in values)
            params = [Json(value) if key == "images" else value for key, value in values.items()]
            cursor.execute(f"UPDATE crop_listings SET {assignments}, updated_at = NOW() WHERE id = %s RETURNING id, lot_code, status", (*params, lot_id))
            row = cursor.fetchone()
        connection.commit()
    return {"id": row[0], "lot_code": row[1], "qr_payload": f"smartmandi://lot/{row[1]}", "status": row[2]}


def delete_crop_lot(lot_id: int = Path(ge=1), user=FarmerUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """UPDATE crop_listings SET status = 'CANCELLED', updated_at = NOW()
                WHERE id = %s AND farmer_user_id = %s AND lot_code IS NOT NULL
                  AND status NOT IN ('SOLD', 'ORDERED') RETURNING id, lot_code""",
                (lot_id, user["id"]),
            )
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Crop lot not found or cannot be cancelled")
        connection.commit()
    return {"id": row[0], "lot_code": row[1], "status": "CANCELLED"}
