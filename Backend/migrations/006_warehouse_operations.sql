-- Warehouse operations: manager approvals, inventory movement, spoilage, and release tracking.
-- Apply after 005_marketplace_growth.sql.

BEGIN;

ALTER TABLE warehouse_bookings
    ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS approved_quantity_kg NUMERIC(14, 3),
    ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;

ALTER TABLE inventory
    ADD COLUMN IF NOT EXISTS booking_id BIGINT REFERENCES warehouse_bookings(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS spoiled_quantity_kg NUMERIC(14, 3) NOT NULL DEFAULT 0 CHECK (spoiled_quantity_kg >= 0),
    ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS spoilage_reason TEXT;

CREATE TABLE IF NOT EXISTS inventory_movements (
    id BIGSERIAL PRIMARY KEY,
    inventory_id BIGINT NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    booking_id BIGINT REFERENCES warehouse_bookings(id) ON DELETE SET NULL,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('RECEIVED', 'MOVED', 'RELEASED', 'SPOILED', 'ADJUSTED')),
    quantity_kg NUMERIC(14, 3) NOT NULL CHECK (quantity_kg > 0),
    from_location TEXT,
    to_location TEXT,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_booking_status ON inventory (booking_id, status);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_inventory ON inventory_movements (inventory_id, created_at DESC);

COMMIT;
