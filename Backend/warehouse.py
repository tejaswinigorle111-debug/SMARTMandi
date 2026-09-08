from datetime import date
from typing import Literal

from fastapi import Depends, HTTPException, Query
from pydantic import BaseModel, Field
from psycopg2.extras import Json

from auth import require_roles
from database import get_db_connection

FarmerUser = Depends(require_roles("FARMER", "FPO"))
WarehouseUser = Depends(require_roles("WAREHOUSE_MANAGER", "ADMIN"))
Participant = Depends(require_roles("FARMER", "FPO", "WAREHOUSE_MANAGER", "ADMIN"))


class BookingDecision(BaseModel):
    status: Literal["CONFIRMED", "CANCELLED"]
    approved_quantity_kg: float | None = Field(default=None, gt=0)


class InventoryReceive(BaseModel):
    booking_id: int
    commodity_name: str = Field(min_length=1, max_length=120)
    quantity_kg: float = Field(gt=0)
    quality_grade: str | None = Field(default=None, max_length=30)
    storage_location: str | None = Field(default=None, max_length=120)
    expected_exit_date: date | None = None


class InventoryMovement(BaseModel):
    quantity_kg: float = Field(gt=0)
    to_location: str | None = Field(default=None, max_length=120)
    reason: str | None = Field(default=None, max_length=500)


class SpoilageReport(BaseModel):
    quantity_kg: float = Field(gt=0)
    reason: str = Field(min_length=3, max_length=500)


class ReleaseInventory(BaseModel):
    quantity_kg: float = Field(gt=0)
    reason: str | None = Field(default=None, max_length=500)


def _warehouse_access(cursor, warehouse_id: int, user):
    cursor.execute("SELECT capacity_kg, status, manager_user_id FROM warehouses WHERE id = %s", (warehouse_id,))
    warehouse = cursor.fetchone()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    if "ADMIN" not in user["roles"] and str(warehouse[2]) != str(user["id"]):
        raise HTTPException(status_code=403, detail="You are not the manager of this warehouse")
    return warehouse


def warehouse_capacity(warehouse_id: int | None = Query(default=None), user=Participant):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            if warehouse_id is not None and "WAREHOUSE_MANAGER" in user["roles"] and "ADMIN" not in user["roles"]:
                _warehouse_access(cursor, warehouse_id, user)
            if warehouse_id is not None:
                cursor.execute("""SELECT warehouses.id, warehouses.name, warehouses.capacity_kg, warehouses.storage_rate_per_kg, warehouses.status,
                    COALESCE(SUM(CASE WHEN inventory.status IN ('IN_STORAGE', 'RESERVED') THEN inventory.quantity_kg - inventory.spoiled_quantity_kg ELSE 0 END), 0)
                    FROM warehouses LEFT JOIN inventory ON inventory.warehouse_id = warehouses.id
                    WHERE warehouses.id = %s GROUP BY warehouses.id""", (warehouse_id,))
            else:
                manager_filter = " AND warehouses.manager_user_id = %s" if "WAREHOUSE_MANAGER" in user["roles"] and "ADMIN" not in user["roles"] else ""
                manager_params = (user["id"],) if manager_filter else ()
                cursor.execute(f"""SELECT warehouses.id, warehouses.name, warehouses.capacity_kg, warehouses.storage_rate_per_kg, warehouses.status,
                    COALESCE(SUM(CASE WHEN inventory.status IN ('IN_STORAGE', 'RESERVED') THEN inventory.quantity_kg - inventory.spoiled_quantity_kg ELSE 0 END), 0)
                    FROM warehouses LEFT JOIN inventory ON inventory.warehouse_id = warehouses.id
                    WHERE warehouses.status = 'ACTIVE'{manager_filter} GROUP BY warehouses.id ORDER BY warehouses.name""", manager_params)
            rows = cursor.fetchall()
    return [{"id": row[0], "name": row[1], "capacity_kg": float(row[2]), "storage_rate_per_kg": float(row[3]), "used_capacity_kg": float(row[5]), "available_capacity_kg": max(0, float(row[2]) - float(row[5])), "status": row[4]} for row in rows]


def list_warehouse_bookings(status: str = Query(default="ALL"), user=Participant):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            if "ADMIN" in user["roles"]:
                scope_sql, scope_params = "TRUE", ()
            elif "WAREHOUSE_MANAGER" in user["roles"]:
                scope_sql, scope_params = "warehouses.manager_user_id = %s", (user["id"],)
            else:
                scope_sql, scope_params = "bookings.farmer_user_id = %s", (user["id"],)
            cursor.execute(f"""SELECT bookings.id, bookings.warehouse_id, warehouses.name, bookings.farmer_user_id,
                users.full_name, bookings.quantity_kg, bookings.approved_quantity_kg, bookings.starts_on, bookings.ends_on,
                bookings.status, bookings.approved_at, bookings.released_at
                FROM warehouse_bookings bookings JOIN warehouses ON warehouses.id = bookings.warehouse_id
                JOIN users ON users.id = bookings.farmer_user_id
                WHERE (%s = 'ALL' OR bookings.status = %s) AND {scope_sql}
                ORDER BY bookings.created_at DESC LIMIT 200""", (status, status, *scope_params))
            return [{"id": row[0], "warehouse_id": row[1], "warehouse_name": row[2], "farmer_user_id": str(row[3]), "farmer_name": row[4], "quantity_kg": float(row[5]), "approved_quantity_kg": float(row[6]) if row[6] is not None else None, "starts_on": row[7].isoformat(), "ends_on": row[8].isoformat() if row[8] else None, "status": row[9], "approved_at": row[10].isoformat() if row[10] else None, "released_at": row[11].isoformat() if row[11] else None} for row in cursor.fetchall()]


def decide_booking(booking_id: int, payload: BookingDecision, user=WarehouseUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT warehouse_id, quantity_kg, status FROM warehouse_bookings WHERE id = %s FOR UPDATE", (booking_id,))
            booking = cursor.fetchone()
            if not booking:
                raise HTTPException(status_code=404, detail="Booking not found")
            _warehouse_access(cursor, booking[0], user)
            if booking[2] != "REQUESTED":
                raise HTTPException(status_code=409, detail="Only requested bookings can be decided")
            if payload.status == "CONFIRMED":
                approved_quantity = payload.approved_quantity_kg or float(booking[1])
                cursor.execute("SELECT capacity_kg - COALESCE(SUM(CASE WHEN inventory.status IN ('IN_STORAGE', 'RESERVED') THEN inventory.quantity_kg - inventory.spoiled_quantity_kg ELSE 0 END), 0) FROM warehouses LEFT JOIN inventory ON inventory.warehouse_id = warehouses.id WHERE warehouses.id = %s GROUP BY warehouses.capacity_kg", (booking[0],))
                available = float(cursor.fetchone()[0])
                if approved_quantity > available:
                    raise HTTPException(status_code=409, detail="Current warehouse capacity is insufficient")
                cursor.execute("UPDATE warehouse_bookings SET status = 'CONFIRMED', approved_quantity_kg = %s, approved_by = %s, approved_at = NOW(), updated_at = NOW() WHERE id = %s", (approved_quantity, user["id"], booking_id))
            else:
                cursor.execute("UPDATE warehouse_bookings SET status = 'CANCELLED', approved_by = %s, approved_at = NOW(), updated_at = NOW() WHERE id = %s", (user["id"], booking_id))
        connection.commit()
    return {"id": booking_id, "status": payload.status}


def receive_inventory(payload: InventoryReceive, user=WarehouseUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT warehouse_id, farmer_user_id, approved_quantity_kg, status, listing_id FROM warehouse_bookings WHERE id = %s FOR UPDATE", (payload.booking_id,))
            booking = cursor.fetchone()
            if not booking or booking[3] != "CONFIRMED":
                raise HTTPException(status_code=409, detail="Booking must be confirmed before receiving inventory")
            _warehouse_access(cursor, booking[0], user)
            if payload.quantity_kg > float(booking[2] or 0):
                raise HTTPException(status_code=422, detail="Received quantity exceeds approved quantity")
            cursor.execute("INSERT INTO commodities (name) VALUES (%s) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id", (payload.commodity_name.strip(),))
            commodity_id = cursor.fetchone()[0]
            cursor.execute("""INSERT INTO inventory (warehouse_id, commodity_id, listing_id, booking_id, quantity_kg, quality_grade, storage_location, expected_exit_date, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'IN_STORAGE') RETURNING id""", (booking[0], commodity_id, booking[4], payload.booking_id, payload.quantity_kg, payload.quality_grade, payload.storage_location, payload.expected_exit_date))
            inventory_id = cursor.fetchone()[0]
            cursor.execute("INSERT INTO inventory_movements (inventory_id, booking_id, actor_user_id, movement_type, quantity_kg, to_location, reason) VALUES (%s, %s, %s, 'RECEIVED', %s, %s, %s)", (inventory_id, payload.booking_id, user["id"], payload.quantity_kg, payload.storage_location, "Warehouse receipt"))
            cursor.execute("UPDATE warehouse_bookings SET status = 'IN_STORAGE', updated_at = NOW() WHERE id = %s", (payload.booking_id,))
        connection.commit()
    return {"id": inventory_id, "booking_id": payload.booking_id, "status": "IN_STORAGE"}


def move_inventory(inventory_id: int, payload: InventoryMovement, user=WarehouseUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT warehouse_id, quantity_kg, spoiled_quantity_kg, status FROM inventory WHERE id = %s FOR UPDATE", (inventory_id,))
            inventory = cursor.fetchone()
            if not inventory:
                raise HTTPException(status_code=404, detail="Inventory record not found")
            _warehouse_access(cursor, inventory[0], user)
            available = float(inventory[1]) - float(inventory[2])
            if inventory[3] not in {"IN_STORAGE", "RESERVED"} or payload.quantity_kg > available:
                raise HTTPException(status_code=409, detail="Inventory quantity is unavailable")
            cursor.execute("UPDATE inventory SET storage_location = COALESCE(%s, storage_location), updated_at = NOW() WHERE id = %s", (payload.to_location, inventory_id))
            cursor.execute("INSERT INTO inventory_movements (inventory_id, actor_user_id, movement_type, quantity_kg, to_location, reason) VALUES (%s, %s, 'MOVED', %s, %s, %s)", (inventory_id, user["id"], payload.quantity_kg, payload.to_location, payload.reason))
        connection.commit()
    return {"id": inventory_id, "status": "MOVED", "quantity_kg": payload.quantity_kg}


def report_spoilage(inventory_id: int, payload: SpoilageReport, user=WarehouseUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT warehouse_id, quantity_kg, spoiled_quantity_kg, status FROM inventory WHERE id = %s FOR UPDATE", (inventory_id,))
            inventory = cursor.fetchone()
            if not inventory:
                raise HTTPException(status_code=404, detail="Inventory record not found")
            _warehouse_access(cursor, inventory[0], user)
            remaining = float(inventory[1]) - float(inventory[2])
            if payload.quantity_kg > remaining:
                raise HTTPException(status_code=422, detail="Spoilage exceeds remaining inventory")
            new_spoiled = float(inventory[2]) + payload.quantity_kg
            new_status = "SPOILED" if new_spoiled >= float(inventory[1]) else inventory[3]
            cursor.execute("UPDATE inventory SET spoiled_quantity_kg = %s, spoilage_reason = %s, status = %s, updated_at = NOW() WHERE id = %s", (new_spoiled, payload.reason, new_status, inventory_id))
            cursor.execute("INSERT INTO inventory_movements (inventory_id, actor_user_id, movement_type, quantity_kg, reason) VALUES (%s, %s, 'SPOILED', %s, %s)", (inventory_id, user["id"], payload.quantity_kg, payload.reason))
        connection.commit()
    return {"id": inventory_id, "status": new_status, "spoiled_quantity_kg": new_spoiled}


def release_inventory(inventory_id: int, payload: ReleaseInventory, user=WarehouseUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT warehouse_id, quantity_kg, spoiled_quantity_kg, status, booking_id FROM inventory WHERE id = %s FOR UPDATE", (inventory_id,))
            inventory = cursor.fetchone()
            if not inventory:
                raise HTTPException(status_code=404, detail="Inventory record not found")
            _warehouse_access(cursor, inventory[0], user)
            available = float(inventory[1]) - float(inventory[2])
            if payload.quantity_kg > available:
                raise HTTPException(status_code=422, detail="Release exceeds remaining inventory")
            new_status = "RELEASED" if payload.quantity_kg >= available else "RESERVED"
            cursor.execute("UPDATE inventory SET status = %s, released_at = CASE WHEN %s = 'RELEASED' THEN NOW() ELSE released_at END, updated_at = NOW() WHERE id = %s", (new_status, new_status, inventory_id))
            cursor.execute("INSERT INTO inventory_movements (inventory_id, booking_id, actor_user_id, movement_type, quantity_kg, reason) VALUES (%s, %s, %s, 'RELEASED', %s, %s)", (inventory_id, inventory[4], user["id"], payload.quantity_kg, payload.reason))
            if new_status == "RELEASED" and inventory[4]:
                cursor.execute("UPDATE warehouse_bookings SET status = 'RELEASED', released_at = NOW(), updated_at = NOW() WHERE id = %s", (inventory[4],))
        connection.commit()
    return {"id": inventory_id, "status": new_status, "released_quantity_kg": payload.quantity_kg}
