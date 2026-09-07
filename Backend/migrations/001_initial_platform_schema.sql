-- SMARTMandi platform schema
-- Apply only after inspecting the target database schema and taking a backup.
-- This migration creates missing tables and never inserts seed or demo records.
-- Existing tables are preserved with CREATE TABLE IF NOT EXISTS.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE CHECK (name IN (
        'FARMER', 'FPO', 'BUYER', 'WAREHOUSE_MANAGER', 'TRANSPORT_PROVIDER', 'ADMIN'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password_hash TEXT,
    full_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS locations (
    id BIGSERIAL PRIMARY KEY,
    address TEXT,
    village TEXT,
    district TEXT,
    state TEXT,
    country TEXT NOT NULL DEFAULT 'India',
    pincode TEXT,
    latitude NUMERIC(9, 6) CHECK (latitude BETWEEN -90 AND 90),
    longitude NUMERIC(9, 6) CHECK (longitude BETWEEN -180 AND 180),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (latitude IS NULL OR longitude IS NOT NULL),
    CHECK (longitude IS NULL OR latitude IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS farmers (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    farm_name TEXT,
    land_area_acres NUMERIC(12, 3) CHECK (land_area_acres IS NULL OR land_area_acres >= 0),
    farming_history TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fpos (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    registration_number TEXT UNIQUE,
    location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fpo_members (
    fpo_id BIGINT NOT NULL REFERENCES fpos(id) ON DELETE CASCADE,
    farmer_user_id UUID NOT NULL REFERENCES farmers(user_id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (fpo_id, farmer_user_id)
);

CREATE TABLE IF NOT EXISTS buyers (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT,
    buyer_type TEXT,
    location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS commodities (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS markets (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    market_type TEXT,
    source TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_prices (
    id BIGSERIAL PRIMARY KEY,
    market_id BIGINT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    commodity_id BIGINT NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
    min_price NUMERIC(14, 2) CHECK (min_price IS NULL OR min_price >= 0),
    max_price NUMERIC(14, 2) CHECK (max_price IS NULL OR max_price >= 0),
    modal_price NUMERIC(14, 2) CHECK (modal_price IS NULL OR modal_price >= 0),
    arrival_quantity NUMERIC(14, 3) CHECK (arrival_quantity IS NULL OR arrival_quantity >= 0),
    price_date DATE NOT NULL,
    source TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (market_id, commodity_id, price_date)
);

CREATE TABLE IF NOT EXISTS crop_listings (
    id BIGSERIAL PRIMARY KEY,
    farmer_user_id UUID NOT NULL REFERENCES farmers(user_id) ON DELETE RESTRICT,
    fpo_id BIGINT REFERENCES fpos(id) ON DELETE SET NULL,
    commodity_id BIGINT NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
    quantity_kg NUMERIC(14, 3) NOT NULL CHECK (quantity_kg > 0),
    minimum_price_per_kg NUMERIC(14, 2) CHECK (minimum_price_per_kg IS NULL OR minimum_price_per_kg >= 0),
    harvest_date DATE,
    preferred_location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    quality_grade TEXT,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'RESERVED', 'SOLD', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offers (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL REFERENCES crop_listings(id) ON DELETE RESTRICT,
    buyer_user_id UUID NOT NULL REFERENCES buyers(user_id) ON DELETE RESTRICT,
    quantity_kg NUMERIC(14, 3) NOT NULL CHECK (quantity_kg > 0),
    offered_price_per_kg NUMERIC(14, 2) NOT NULL CHECK (offered_price_per_kg >= 0),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    listing_id BIGINT NOT NULL REFERENCES crop_listings(id) ON DELETE RESTRICT,
    offer_id BIGINT UNIQUE REFERENCES offers(id) ON DELETE RESTRICT,
    farmer_user_id UUID NOT NULL REFERENCES farmers(user_id) ON DELETE RESTRICT,
    buyer_user_id UUID NOT NULL REFERENCES buyers(user_id) ON DELETE RESTRICT,
    quantity_kg NUMERIC(14, 3) NOT NULL CHECK (quantity_kg > 0),
    agreed_price_per_kg NUMERIC(14, 2) NOT NULL CHECK (agreed_price_per_kg >= 0),
    status TEXT NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'CONFIRMED', 'PROCESSING', 'DELIVERED', 'CANCELLED', 'COMPLETED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE RESTRICT,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAYMENT_INITIATED', 'PAYMENT_CONFIRMED', 'ESCROWED', 'RELEASED', 'FAILED', 'REFUNDED')),
    provider_reference TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warehouses (
    id BIGSERIAL PRIMARY KEY,
    manager_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    capacity_kg NUMERIC(14, 3) NOT NULL CHECK (capacity_kg >= 0),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
    id BIGSERIAL PRIMARY KEY,
    warehouse_id BIGINT NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    commodity_id BIGINT NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
    listing_id BIGINT REFERENCES crop_listings(id) ON DELETE SET NULL,
    quantity_kg NUMERIC(14, 3) NOT NULL CHECK (quantity_kg >= 0),
    quality_grade TEXT,
    storage_location TEXT,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_exit_date DATE,
    status TEXT NOT NULL DEFAULT 'IN_STORAGE' CHECK (status IN ('IN_STORAGE', 'RESERVED', 'RELEASED', 'SPOILED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    provider_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    registration_number TEXT NOT NULL UNIQUE,
    vehicle_type TEXT NOT NULL,
    capacity_kg NUMERIC(14, 3) NOT NULL CHECK (capacity_kg > 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drivers (
    id BIGSERIAL PRIMARY KEY,
    provider_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    phone TEXT,
    license_number TEXT UNIQUE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE RESTRICT,
    vehicle_id BIGINT REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id BIGINT REFERENCES drivers(id) ON DELETE SET NULL,
    pickup_location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    destination_location_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'ASSIGNED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED', 'CANCELLED')),
    scheduled_pickup_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    last_latitude NUMERIC(9, 6) CHECK (last_latitude IS NULL OR last_latitude BETWEEN -90 AND 90),
    last_longitude NUMERIC(9, 6) CHECK (last_longitude IS NULL OR last_longitude BETWEEN -180 AND 180),
    last_location_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    reviewer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reviewee_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (order_id, reviewer_user_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_type TEXT,
    entity_id BIGINT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_prices_commodity_date ON market_prices (commodity_id, price_date DESC);
CREATE INDEX IF NOT EXISTS idx_crop_listings_status_commodity ON crop_listings (status, commodity_id);
CREATE INDEX IF NOT EXISTS idx_offers_listing_status ON offers (listing_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_status ON orders (buyer_user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_farmer_status ON orders (farmer_user_id, status);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments (status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, is_read, created_at DESC);

COMMIT;
