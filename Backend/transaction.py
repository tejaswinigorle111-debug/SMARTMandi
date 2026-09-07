from datetime import date
from typing import Any, Literal

from fastapi import Depends, HTTPException, Query
from pydantic import BaseModel, Field
from psycopg2.extras import Json

from auth import require_roles
from database import get_db_connection


FarmerUser = Depends(require_roles("FARMER", "FPO"))
BuyerUser = Depends(require_roles("BUYER"))
AnyParticipant = Depends(require_roles("FARMER", "FPO", "BUYER", "WAREHOUSE_MANAGER", "TRANSPORT_PROVIDER", "ADMIN"))
AdminUser = Depends(require_roles("ADMIN"))


class DemandCreate(BaseModel):
    commodity_name: str = Field(min_length=1, max_length=120)
    quantity_kg: float = Field(gt=0)
    target_price_per_kg: float | None = Field(default=None, ge=0)
    quality_requirements: dict[str, Any] = Field(default_factory=dict)
    delivery_location: str | None = Field(default=None, max_length=240)
    delivery_from: date | None = None
    delivery_to: date | None = None


class QualityInspectionCreate(BaseModel):
    grade: Literal["A", "B", "C", "REJECTED"]
    attributes: dict[str, Any] = Field(default_factory=dict)
    evidence_urls: list[str] = Field(default_factory=list, max_length=8)
    notes: str | None = Field(default=None, max_length=1000)


class OfferDecision(BaseModel):
    action: Literal["ACCEPT", "REJECT", "COUNTER"]
    quantity_kg: float | None = Field(default=None, gt=0)
    price_per_kg: float | None = Field(default=None, gt=0)
    expires_at: str | None = None
    note: str | None = Field(default=None, max_length=500)


class ShipmentAssignment(BaseModel):
    vehicle_id: int | None = None
    driver_id: int | None = None
    scheduled_pickup_at: str | None = None


class WarehouseBookingCreate(BaseModel):
    warehouse_id: int
    quantity_kg: float = Field(gt=0)
    listing_id: int | None = None
    storage_rate_per_kg: float = Field(default=0, ge=0)
    starts_on: date
    ends_on: date | None = None


class PaymentTransition(BaseModel):
    status: Literal["PAYMENT_INITIATED", "PAYMENT_CONFIRMED", "ESCROWED", "RELEASED", "FAILED", "REFUNDED"]
    provider_reference: str | None = Field(default=None, max_length=180)
    note: str | None = Field(default=None, max_length=500)


class DisputeCreate(BaseModel):
    category: str = Field(min_length=2, max_length=80)
    description: str = Field(min_length=10, max_length=3000)
    evidence_urls: list[str] = Field(default_factory=list, max_length=8)


class DisputeDecision(BaseModel):
    status: Literal["UNDER_REVIEW", "RESOLVED", "REJECTED", "ESCALATED"]
    resolution: str | None = Field(default=None, max_length=2000)


class ProfitCreate(BaseModel):
    transport_cost: float = Field(default=0, ge=0)
    storage_cost: float = Field(default=0, ge=0)
    commission_cost: float = Field(default=0, ge=0)
    wastage_cost: float = Field(default=0, ge=0)
    other_cost: float = Field(default=0, ge=0)


def _event(cursor, entity_type: str, entity_id: int, actor_id: str, event_type: str, from_status: str | None = None, to_status: str | None = None, metadata: dict[str, Any] | None = None):
    cursor.execute(
        """INSERT INTO transaction_events
        (entity_type, entity_id, actor_user_id, from_status, to_status, event_type, metadata)
        VALUES (%s, %s, %s, %s, %s, %s, %s)""",
        (entity_type, entity_id, actor_id, from_status, to_status, event_type, Json(metadata or {})),
    )


def create_buyer_demand(payload: DemandCreate, user=BuyerUser):
    if payload.delivery_from and payload.delivery_to and payload.delivery_from > payload.delivery_to:
        raise HTTPException(status_code=422, detail="Delivery start cannot be after delivery end")
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("INSERT INTO commodities (name) VALUES (%s) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id", (payload.commodity_name.strip(),))
            commodity_id = cursor.fetchone()[0]
            cursor.execute(
                """INSERT INTO buyer_demands
                (buyer_user_id, commodity_id, quantity_kg, target_price_per_kg, quality_requirements, delivery_location, delivery_from, delivery_to)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
                (user["id"], commodity_id, payload.quantity_kg, payload.target_price_per_kg, Json(payload.quality_requirements), payload.delivery_location, payload.delivery_from, payload.delivery_to),
            )
            demand_id = cursor.fetchone()[0]
            _event(cursor, "DEMAND", demand_id, user["id"], "CREATED", to_status="OPEN", metadata={"commodity": payload.commodity_name})
        connection.commit()
    return {"id": demand_id, "status": "OPEN"}


def list_buyer_demands(user=AnyParticipant, status: str = Query(default="OPEN")):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """SELECT demands.id, commodities.name, demands.quantity_kg, demands.target_price_per_kg,
                demands.quality_requirements, demands.delivery_location, demands.delivery_from, demands.delivery_to,
                demands.status, demands.created_at, users.full_name
                FROM buyer_demands demands JOIN commodities ON commodities.id = demands.commodity_id
                JOIN users ON users.id = demands.buyer_user_id
                WHERE (%s = 'ALL' OR demands.status = %s) ORDER BY demands.created_at DESC LIMIT 100""",
                (status, status),
            )
            return [{"id": row[0], "commodity": row[1], "quantity_kg": float(row[2]), "target_price_per_kg": float(row[3]) if row[3] is not None else None, "quality_requirements": row[4], "delivery_location": row[5], "delivery_from": row[6].isoformat() if row[6] else None, "delivery_to": row[7].isoformat() if row[7] else None, "status": row[8], "created_at": row[9].isoformat(), "buyer_name": row[10]} for row in cursor.fetchall()]


def inspect_listing(listing_id: int, payload: QualityInspectionCreate, user=AnyParticipant):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id FROM crop_listings WHERE id = %s", (listing_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Listing not found")
            cursor.execute("""INSERT INTO quality_inspections (listing_id, inspector_user_id, grade, attributes, evidence_urls, notes)
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""", (listing_id, user["id"], payload.grade, Json(payload.attributes), Json(payload.evidence_urls), payload.notes))
            inspection_id = cursor.fetchone()[0]
            cursor.execute("UPDATE crop_listings SET quality_grade = %s, quality_details = COALESCE(%s, quality_details), updated_at = NOW() WHERE id = %s", (payload.grade, payload.notes, listing_id))
            _event(cursor, "LISTING", listing_id, user["id"], "QUALITY_INSPECTED", metadata={"inspection_id": inspection_id, "grade": payload.grade})
        connection.commit()
    return {"id": inspection_id, "listing_id": listing_id, "grade": payload.grade}


def decide_offer(offer_id: int, payload: OfferDecision, user=FarmerUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("""SELECT offers.listing_id, offers.buyer_user_id, offers.quantity_kg, offers.offered_price_per_kg,
                offers.status, listings.farmer_user_id, listings.status
                FROM offers JOIN crop_listings listings ON listings.id = offers.listing_id
                WHERE offers.id = %s FOR UPDATE""", (offer_id,))
            offer = cursor.fetchone()
            if not offer or str(offer[5]) != str(user["id"]):
                raise HTTPException(status_code=404, detail="Offer not found")
            if offer[4] != "PENDING":
                raise HTTPException(status_code=409, detail="Only pending offers can be decided")
            if payload.action == "COUNTER":
                if payload.quantity_kg is None or payload.price_per_kg is None:
                    raise HTTPException(status_code=422, detail="Counteroffers require quantity and price")
                cursor.execute("""INSERT INTO offers (listing_id, buyer_user_id, quantity_kg, offered_price_per_kg, parent_offer_id, expires_at)
                    VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""", (offer[0], offer[1], payload.quantity_kg, payload.price_per_kg, offer_id, payload.expires_at))
                new_offer_id = cursor.fetchone()[0]
                cursor.execute("UPDATE offers SET status = 'REJECTED', responded_at = NOW() WHERE id = %s", (offer_id,))
                _event(cursor, "OFFER", offer_id, user["id"], "COUNTERED", from_status="PENDING", to_status="REJECTED", metadata={"counter_offer_id": new_offer_id, "note": payload.note})
                result = {"id": new_offer_id, "status": "PENDING", "parent_offer_id": offer_id}
            elif payload.action == "REJECT":
                cursor.execute("UPDATE offers SET status = 'REJECTED', responded_at = NOW() WHERE id = %s", (offer_id,))
                _event(cursor, "OFFER", offer_id, user["id"], "REJECTED", from_status="PENDING", to_status="REJECTED", metadata={"note": payload.note})
                result = {"id": offer_id, "status": "REJECTED"}
            else:
                cursor.execute("UPDATE offers SET status = 'ACCEPTED', responded_at = NOW() WHERE id = %s", (offer_id,))
                cursor.execute("""INSERT INTO orders (listing_id, offer_id, farmer_user_id, buyer_user_id, quantity_kg, agreed_price_per_kg)
                    VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""", (offer[0], offer_id, user["id"], offer[1], offer[2], offer[3]))
                order_id = cursor.fetchone()[0]
                cursor.execute("INSERT INTO payments (order_id, amount) VALUES (%s, %s)", (order_id, float(offer[2]) * float(offer[3])))
                cursor.execute("UPDATE crop_listings SET status = 'ORDERED', updated_at = NOW() WHERE id = %s", (offer[0],))
                _event(cursor, "OFFER", offer_id, user["id"], "ACCEPTED", from_status="PENDING", to_status="ACCEPTED", metadata={"order_id": order_id})
                _event(cursor, "ORDER", order_id, user["id"], "CREATED", to_status="CREATED", metadata={"offer_id": offer_id})
                result = {"id": offer_id, "status": "ACCEPTED", "order_id": order_id}
        connection.commit()
    return result


def create_shipment(order_id: int, payload: ShipmentAssignment, user=AnyParticipant):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT status FROM orders WHERE id = %s AND (buyer_user_id = %s OR farmer_user_id = %s)", (order_id, user["id"], user["id"]))
            order = cursor.fetchone()
            if not order:
                raise HTTPException(status_code=404, detail="Order not found")
            cursor.execute("""INSERT INTO shipments (order_id, vehicle_id, driver_id, status, scheduled_pickup_at)
                VALUES (%s, %s, %s, 'ASSIGNED', %s)
                ON CONFLICT (order_id) DO UPDATE SET vehicle_id = EXCLUDED.vehicle_id, driver_id = EXCLUDED.driver_id,
                status = 'ASSIGNED', scheduled_pickup_at = EXCLUDED.scheduled_pickup_at, updated_at = NOW()
                RETURNING id""", (order_id, payload.vehicle_id, payload.driver_id, payload.scheduled_pickup_at))
            shipment_id = cursor.fetchone()[0]
            _event(cursor, "ORDER", order_id, user["id"], "SHIPMENT_ASSIGNED", metadata={"shipment_id": shipment_id, "vehicle_id": payload.vehicle_id, "driver_id": payload.driver_id})
        connection.commit()
    return {"id": shipment_id, "order_id": order_id, "status": "ASSIGNED"}


def book_warehouse(payload: WarehouseBookingCreate, user=FarmerUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT capacity_kg, status FROM warehouses WHERE id = %s", (payload.warehouse_id,))
            warehouse = cursor.fetchone()
            if not warehouse or warehouse[1] != "ACTIVE":
                raise HTTPException(status_code=404, detail="Active warehouse not found")
            cursor.execute("SELECT COALESCE(SUM(quantity_kg), 0) FROM warehouse_bookings WHERE warehouse_id = %s AND status IN ('REQUESTED', 'CONFIRMED', 'IN_STORAGE')", (payload.warehouse_id,))
            used = float(cursor.fetchone()[0])
            if used + payload.quantity_kg > float(warehouse[0]):
                raise HTTPException(status_code=409, detail="Warehouse capacity is insufficient")
            cursor.execute("""INSERT INTO warehouse_bookings (warehouse_id, farmer_user_id, listing_id, quantity_kg, storage_rate_per_kg, starts_on, ends_on)
                VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id""", (payload.warehouse_id, user["id"], payload.listing_id, payload.quantity_kg, payload.storage_rate_per_kg, payload.starts_on, payload.ends_on))
            booking_id = cursor.fetchone()[0]
            _event(cursor, "WAREHOUSE_BOOKING", booking_id, user["id"], "REQUESTED", to_status="REQUESTED")
        connection.commit()
    return {"id": booking_id, "status": "REQUESTED"}


def transition_payment(payment_id: int, payload: PaymentTransition, user=AnyParticipant):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("""SELECT payments.status, orders.buyer_user_id, orders.farmer_user_id, payments.order_id
                FROM payments JOIN orders ON orders.id = payments.order_id WHERE payments.id = %s""", (payment_id,))
            payment = cursor.fetchone()
            if not payment or str(user["id"]) not in {str(payment[1]), str(payment[2])} and "ADMIN" not in user["roles"]:
                raise HTTPException(status_code=404, detail="Payment not found")
            cursor.execute("UPDATE payments SET status = %s, provider_reference = COALESCE(%s, provider_reference), updated_at = NOW() WHERE id = %s", (payload.status, payload.provider_reference, payment_id))
            cursor.execute("INSERT INTO payment_events (payment_id, actor_user_id, from_status, to_status, provider_reference, note) VALUES (%s, %s, %s, %s, %s, %s)", (payment_id, user["id"], payment[0], payload.status, payload.provider_reference, payload.note))
            _event(cursor, "PAYMENT", payment_id, user["id"], "STATUS_CHANGED", from_status=payment[0], to_status=payload.status, metadata={"order_id": payment[3]})
        connection.commit()
    return {"id": payment_id, "status": payload.status}


def open_dispute(order_id: int, payload: DisputeCreate, user=AnyParticipant):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT buyer_user_id, farmer_user_id FROM orders WHERE id = %s", (order_id,))
            order = cursor.fetchone()
            if not order or str(user["id"]) not in {str(order[0]), str(order[1])}:
                raise HTTPException(status_code=404, detail="Order not found")
            cursor.execute("INSERT INTO disputes (order_id, opened_by, category, description, evidence_urls) VALUES (%s, %s, %s, %s, %s) RETURNING id", (order_id, user["id"], payload.category, payload.description, Json(payload.evidence_urls)))
            dispute_id = cursor.fetchone()[0]
            _event(cursor, "DISPUTE", dispute_id, user["id"], "OPENED", to_status="OPEN", metadata={"order_id": order_id})
        connection.commit()
    return {"id": dispute_id, "order_id": order_id, "status": "OPEN"}


def decide_dispute(dispute_id: int, payload: DisputeDecision, user=AdminUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT status FROM disputes WHERE id = %s FOR UPDATE", (dispute_id,))
            dispute = cursor.fetchone()
            if not dispute:
                raise HTTPException(status_code=404, detail="Dispute not found")
            cursor.execute("UPDATE disputes SET status = %s, resolution = %s, resolved_by = %s, updated_at = NOW() WHERE id = %s", (payload.status, payload.resolution, user["id"], dispute_id))
            _event(cursor, "DISPUTE", dispute_id, user["id"], "STATUS_CHANGED", from_status=dispute[0], to_status=payload.status, metadata={"resolution": payload.resolution})
        connection.commit()
    return {"id": dispute_id, "status": payload.status}


def list_audit_events(entity_type: str, entity_id: int, user=AnyParticipant):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, event_type, actor_user_id, from_status, to_status, metadata, created_at FROM transaction_events WHERE entity_type = %s AND entity_id = %s ORDER BY created_at ASC", (entity_type.upper(), entity_id))
            return [{"id": row[0], "event_type": row[1], "actor_user_id": str(row[2]) if row[2] else None, "from_status": row[3], "to_status": row[4], "metadata": row[5], "created_at": row[6].isoformat()} for row in cursor.fetchall()]


def record_profit(order_id: int, payload: ProfitCreate, user=FarmerUser):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT farmer_user_id, quantity_kg, agreed_price_per_kg, status FROM orders WHERE id = %s", (order_id,))
            order = cursor.fetchone()
            if not order or str(order[0]) != str(user["id"]):
                raise HTTPException(status_code=404, detail="Order not found")
            if order[3] not in {"DELIVERED", "COMPLETED"}:
                raise HTTPException(status_code=409, detail="Profit can be recorded after delivery")
            gross = float(order[1]) * float(order[2])
            costs = payload.transport_cost + payload.storage_cost + payload.commission_cost + payload.wastage_cost + payload.other_cost
            net = max(0, gross - costs)
            cursor.execute("""INSERT INTO profit_realizations
                (order_id, farmer_user_id, gross_amount, transport_cost, storage_cost, commission_cost, wastage_cost, other_cost, net_amount)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (order_id) DO UPDATE SET transport_cost = EXCLUDED.transport_cost, storage_cost = EXCLUDED.storage_cost,
                commission_cost = EXCLUDED.commission_cost, wastage_cost = EXCLUDED.wastage_cost, other_cost = EXCLUDED.other_cost,
                net_amount = EXCLUDED.net_amount RETURNING id""", (order_id, user["id"], gross, payload.transport_cost, payload.storage_cost, payload.commission_cost, payload.wastage_cost, payload.other_cost, net))
            realization_id = cursor.fetchone()[0]
            _event(cursor, "ORDER", order_id, user["id"], "PROFIT_RECORDED", metadata={"realization_id": realization_id, "gross_amount": gross, "net_amount": net})
        connection.commit()
    return {"id": realization_id, "order_id": order_id, "gross_amount": gross, "net_amount": net}
