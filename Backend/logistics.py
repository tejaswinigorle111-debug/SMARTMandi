from fastapi import Depends, HTTPException, Path, Query

from auth import require_roles
from database import get_db_connection


Participant = Depends(require_roles("FARMER", "FPO", "BUYER", "TRANSPORT_PROVIDER", "WAREHOUSE_MANAGER", "ADMIN"))


def _scope_condition(user, alias: str = "orders") -> tuple[str, tuple[str, ...]]:
    if "ADMIN" in user["roles"]:
        return "TRUE", ()
    if "FARMER" in user["roles"] or "FPO" in user["roles"]:
        return f"{alias}.farmer_user_id = %s", (user["id"],)
    if "BUYER" in user["roles"]:
        return f"{alias}.buyer_user_id = %s", (user["id"],)
    if "TRANSPORT_PROVIDER" in user["roles"]:
        return "(shipments.vehicle_id IN (SELECT id FROM vehicles WHERE provider_user_id = %s) OR shipments.driver_id IN (SELECT id FROM drivers WHERE provider_user_id = %s))", (user["id"], user["id"])
    return "FALSE", ()


def logistics_options(user=Participant):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            if "WAREHOUSE_MANAGER" in user["roles"] and "ADMIN" not in user["roles"]:
                cursor.execute("""SELECT warehouses.id, warehouses.name, warehouses.capacity_kg, warehouses.storage_rate_per_kg, warehouses.status,
                    COALESCE(SUM(CASE WHEN inventory.status IN ('IN_STORAGE', 'RESERVED') THEN inventory.quantity_kg - inventory.spoiled_quantity_kg ELSE 0 END), 0)
                    FROM warehouses LEFT JOIN inventory ON inventory.warehouse_id = warehouses.id
                    WHERE warehouses.manager_user_id = %s GROUP BY warehouses.id ORDER BY warehouses.name""", (user["id"],))
            else:
                cursor.execute("""SELECT warehouses.id, warehouses.name, warehouses.capacity_kg, warehouses.storage_rate_per_kg, warehouses.status,
                    COALESCE(SUM(CASE WHEN inventory.status IN ('IN_STORAGE', 'RESERVED') THEN inventory.quantity_kg - inventory.spoiled_quantity_kg ELSE 0 END), 0)
                    FROM warehouses LEFT JOIN inventory ON inventory.warehouse_id = warehouses.id
                    WHERE warehouses.status = 'ACTIVE' GROUP BY warehouses.id ORDER BY warehouses.name""")
            warehouses = [{"id": row[0], "name": row[1], "capacity_kg": float(row[2]), "storage_rate_per_kg": float(row[3]), "used_capacity_kg": float(row[5]), "available_capacity_kg": max(0, float(row[2]) - float(row[5])), "status": row[4]} for row in cursor.fetchall()]
            vehicle_clause = "WHERE FALSE" if "WAREHOUSE_MANAGER" in user["roles"] and "ADMIN" not in user["roles"] else ("" if "ADMIN" in user["roles"] or "TRANSPORT_PROVIDER" not in user["roles"] else "WHERE vehicles.provider_user_id = %s")
            vehicle_params = (user["id"],) if "TRANSPORT_PROVIDER" in user["roles"] and "ADMIN" not in user["roles"] and "WAREHOUSE_MANAGER" not in user["roles"] else ()
            cursor.execute(f"""SELECT vehicles.id, vehicles.registration_number, vehicles.vehicle_type, vehicles.capacity_kg, vehicles.is_available, users.full_name
                FROM vehicles JOIN users ON users.id = vehicles.provider_user_id {vehicle_clause} ORDER BY vehicles.registration_number""", vehicle_params)
            vehicles = [{"id": row[0], "name": row[1], "vehicle_type": row[2], "capacity_kg": float(row[3]), "is_available": row[4], "provider_name": row[5]} for row in cursor.fetchall()]
            driver_clause = "WHERE FALSE" if "WAREHOUSE_MANAGER" in user["roles"] and "ADMIN" not in user["roles"] else ("" if "ADMIN" in user["roles"] or "TRANSPORT_PROVIDER" not in user["roles"] else "WHERE drivers.provider_user_id = %s")
            driver_params = (user["id"],) if "TRANSPORT_PROVIDER" in user["roles"] and "ADMIN" not in user["roles"] and "WAREHOUSE_MANAGER" not in user["roles"] else ()
            cursor.execute(f"""SELECT drivers.id, drivers.name, drivers.phone, drivers.is_available, users.full_name
                FROM drivers JOIN users ON users.id = drivers.provider_user_id {driver_clause} ORDER BY drivers.name""", driver_params)
            drivers = [{"id": row[0], "name": row[1], "phone": row[2], "is_available": row[3], "provider_name": row[4]} for row in cursor.fetchall()]
            if "ADMIN" in user["roles"]:
                order_condition, order_params = "TRUE", ()
            elif "FARMER" in user["roles"] or "FPO" in user["roles"]:
                order_condition, order_params = "orders.farmer_user_id = %s", (user["id"],)
            elif "BUYER" in user["roles"]:
                order_condition, order_params = "orders.buyer_user_id = %s", (user["id"],)
            elif "WAREHOUSE_MANAGER" in user["roles"]:
                order_condition, order_params = "FALSE", ()
            else:
                order_condition, order_params = "TRUE", ()
            cursor.execute(f"""SELECT orders.id, commodities.name, farmer_users.full_name, buyer_users.full_name, orders.status
                FROM orders JOIN crop_listings ON crop_listings.id = orders.listing_id
                JOIN commodities ON commodities.id = crop_listings.commodity_id
                JOIN users farmer_users ON farmer_users.id = orders.farmer_user_id
                JOIN users buyer_users ON buyer_users.id = orders.buyer_user_id
                WHERE {order_condition} ORDER BY orders.created_at DESC LIMIT 200""", order_params)
            orders = [{"id": row[0], "name": f"{row[1]} · {row[2]} to {row[3]}", "crop": row[1], "farmer_name": row[2], "buyer_name": row[3], "status": row[4]} for row in cursor.fetchall()]
    return {"warehouses": warehouses, "vehicles": vehicles, "drivers": drivers, "orders": orders}


def list_logistics_shipments(status: str = Query(default="ALL"), user=Participant):
    condition, params = _scope_condition(user)
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(f"""SELECT shipments.id, shipments.order_id, commodities.name, farmer_users.full_name,
                buyer_users.full_name, vehicles.registration_number, drivers.name, shipments.status,
                shipments.scheduled_pickup_at, shipments.picked_up_at, shipments.delivered_at,
                shipments.transport_rate_per_kg
                FROM shipments JOIN orders ON orders.id = shipments.order_id
                JOIN crop_listings ON crop_listings.id = orders.listing_id
                JOIN commodities ON commodities.id = crop_listings.commodity_id
                JOIN users farmer_users ON farmer_users.id = orders.farmer_user_id
                JOIN users buyer_users ON buyer_users.id = orders.buyer_user_id
                LEFT JOIN vehicles ON vehicles.id = shipments.vehicle_id
                LEFT JOIN drivers ON drivers.id = shipments.driver_id
                WHERE ({condition}) AND (%s = 'ALL' OR shipments.status = %s)
                ORDER BY shipments.created_at DESC LIMIT 200""", (*params, status, status))
            return [{"shipment_id": row[0], "order_id": row[1], "crop": row[2], "farmer_name": row[3], "buyer_name": row[4], "vehicle_name": row[5], "driver_name": row[6], "status": row[7], "scheduled_pickup_at": row[8].isoformat() if row[8] else None, "picked_up_at": row[9].isoformat() if row[9] else None, "delivered_at": row[10].isoformat() if row[10] else None, "transport_rate_per_kg": float(row[11]) if row[11] is not None else None} for row in cursor.fetchall()]


def list_logistics_inventory(user=Participant):
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            if "ADMIN" in user["roles"]:
                condition, params = "TRUE", ()
            elif "WAREHOUSE_MANAGER" in user["roles"]:
                condition, params = "warehouses.manager_user_id = %s", (user["id"],)
            else:
                condition, params = "bookings.farmer_user_id = %s", (user["id"],)
            cursor.execute(f"""SELECT inventory.id, warehouses.name, commodities.name, inventory.quantity_kg,
                inventory.spoiled_quantity_kg, inventory.storage_location, inventory.status,
                bookings.status, users.full_name, inventory.expected_exit_date
                FROM inventory JOIN warehouses ON warehouses.id = inventory.warehouse_id
                JOIN commodities ON commodities.id = inventory.commodity_id
                LEFT JOIN warehouse_bookings bookings ON bookings.id = inventory.booking_id
                LEFT JOIN users ON users.id = bookings.farmer_user_id
                WHERE {condition} ORDER BY inventory.updated_at DESC LIMIT 200""", params)
            return [{"inventory_id": row[0], "warehouse_name": row[1], "crop": row[2], "quantity_kg": float(row[3]), "spoiled_quantity_kg": float(row[4]), "storage_location": row[5], "status": row[6], "booking_status": row[7], "farmer_name": row[8], "expected_exit_date": row[9].isoformat() if row[9] else None} for row in cursor.fetchall()]


def logistics_timeline(order_id: int = Path(ge=1), user=Participant):
    condition, params = _scope_condition(user)
    with get_db_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(f"""SELECT orders.id, commodities.name, farmer_users.full_name, buyer_users.full_name,
                shipments.status, shipments.scheduled_pickup_at, shipments.picked_up_at, shipments.delivered_at,
                transaction_events.event_type, transaction_events.to_status, transaction_events.created_at
                FROM orders JOIN crop_listings ON crop_listings.id = orders.listing_id
                JOIN commodities ON commodities.id = crop_listings.commodity_id
                JOIN users farmer_users ON farmer_users.id = orders.farmer_user_id
                JOIN users buyer_users ON buyer_users.id = orders.buyer_user_id
                LEFT JOIN shipments ON shipments.order_id = orders.id
                LEFT JOIN transaction_events ON transaction_events.entity_type = 'ORDER' AND transaction_events.entity_id = orders.id
                WHERE orders.id = %s AND ({condition}) ORDER BY transaction_events.created_at ASC""", (order_id, *params))
            rows = cursor.fetchall()
            if not rows:
                raise HTTPException(status_code=404, detail="Delivery timeline not found")
            first = rows[0]
            return {"order_id": first[0], "crop": first[1], "farmer_name": first[2], "buyer_name": first[3], "shipment_status": first[4], "scheduled_pickup_at": first[5].isoformat() if first[5] else None, "picked_up_at": first[6].isoformat() if first[6] else None, "delivered_at": first[7].isoformat() if first[7] else None, "events": [{"event_type": row[8], "status": row[9], "created_at": row[10].isoformat()} for row in rows if row[8]]}
