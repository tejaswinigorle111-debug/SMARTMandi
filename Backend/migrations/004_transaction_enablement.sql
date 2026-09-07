-- Transaction enablement: demand, quality, workflow state, storage, disputes, and outcome records.
-- Apply after 003_farmer_module.sql.

BEGIN;

ALTER TABLE offers
    ADD COLUMN IF NOT EXISTS parent_offer_id BIGINT REFERENCES offers(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

ALTER TABLE buyers
    ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS verification_notes TEXT;

CREATE TABLE IF NOT EXISTS buyer_demands (
    id BIGSERIAL PRIMARY KEY,
    buyer_user_id UUID NOT NULL REFERENCES buyers(user_id) ON DELETE CASCADE,
    commodity_id BIGINT NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
    quantity_kg NUMERIC(14, 3) NOT NULL CHECK (quantity_kg > 0),
    target_price_per_kg NUMERIC(14, 2) CHECK (target_price_per_kg IS NULL OR target_price_per_kg >= 0),
    quality_requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
    delivery_location TEXT,
    delivery_from DATE,
    delivery_to DATE,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'MATCHED', 'FULFILLED', 'CANCELLED', 'EXPIRED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quality_inspections (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL REFERENCES crop_listings(id) ON DELETE CASCADE,
    inspector_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    grade TEXT NOT NULL,
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    evidence_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    inspected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warehouse_bookings (
    id BIGSERIAL PRIMARY KEY,
    warehouse_id BIGINT NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    farmer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    listing_id BIGINT REFERENCES crop_listings(id) ON DELETE SET NULL,
    quantity_kg NUMERIC(14, 3) NOT NULL CHECK (quantity_kg > 0),
    storage_rate_per_kg NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (storage_rate_per_kg >= 0),
    starts_on DATE NOT NULL,
    ends_on DATE,
    status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'CONFIRMED', 'IN_STORAGE', 'RELEASED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_events (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    from_status TEXT,
    to_status TEXT NOT NULL,
    provider_reference TEXT,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS disputes (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    opened_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED', 'ESCALATED')),
    resolution TEXT,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transaction_events (
    id BIGSERIAL PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id BIGINT NOT NULL,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    from_status TEXT,
    to_status TEXT,
    event_type TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profit_realizations (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE RESTRICT,
    farmer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    gross_amount NUMERIC(14, 2) NOT NULL CHECK (gross_amount >= 0),
    transport_cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (transport_cost >= 0),
    storage_cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (storage_cost >= 0),
    commission_cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (commission_cost >= 0),
    wastage_cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (wastage_cost >= 0),
    other_cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (other_cost >= 0),
    net_amount NUMERIC(14, 2) NOT NULL CHECK (net_amount >= 0),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buyer_demands_open ON buyer_demands (status, commodity_id, delivery_to);
CREATE INDEX IF NOT EXISTS idx_quality_inspections_listing ON quality_inspections (listing_id, inspected_at DESC);
CREATE INDEX IF NOT EXISTS idx_warehouse_bookings_farmer ON warehouse_bookings (farmer_user_id, status);
CREATE INDEX IF NOT EXISTS idx_disputes_order_status ON disputes (order_id, status);
CREATE INDEX IF NOT EXISTS idx_transaction_events_entity ON transaction_events (entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profit_realizations_farmer ON profit_realizations (farmer_user_id, recorded_at DESC);

COMMIT;
