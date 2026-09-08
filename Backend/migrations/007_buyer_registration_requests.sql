-- Persist public buyer-registration submissions for admin review.

BEGIN;

CREATE TABLE IF NOT EXISTS buyer_registration_requests (
    id BIGSERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    buyer_type TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    email TEXT,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    market_area TEXT NOT NULL,
    business_address TEXT NOT NULL,
    preferred_crops TEXT[] NOT NULL DEFAULT '{}',
    min_quantity NUMERIC(14, 3) NOT NULL CHECK (min_quantity > 0),
    max_quantity NUMERIC(14, 3) NOT NULL CHECK (max_quantity >= min_quantity),
    quantity_unit TEXT NOT NULL,
    min_price NUMERIC(14, 2) NOT NULL CHECK (min_price >= 0),
    max_price NUMERIC(14, 2) NOT NULL CHECK (max_price >= min_price),
    buying_frequency TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CONTACTED')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buyer_registration_requests_status
    ON buyer_registration_requests (status, created_at DESC);

COMMIT;