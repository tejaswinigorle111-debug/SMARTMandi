-- Marketplace growth: verification, FPO pooled lots, matching, and alerts.
-- Apply after 004_transaction_enablement.sql.

BEGIN;

CREATE TABLE IF NOT EXISTS buyer_verification_documents (
    id BIGSERIAL PRIMARY KEY,
    buyer_user_id UUID NOT NULL REFERENCES buyers(user_id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_reference TEXT,
    document_url TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    review_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pooled_lots (
    id BIGSERIAL PRIMARY KEY,
    fpo_id BIGINT NOT NULL REFERENCES fpos(id) ON DELETE RESTRICT,
    commodity_id BIGINT NOT NULL REFERENCES commodities(id) ON DELETE RESTRICT,
    total_quantity_kg NUMERIC(14, 3) NOT NULL CHECK (total_quantity_kg > 0),
    target_price_per_kg NUMERIC(14, 2) CHECK (target_price_per_kg IS NULL OR target_price_per_kg >= 0),
    quality_grade TEXT,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'OFFERED', 'SOLD', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pooled_lot_members (
    lot_id BIGINT NOT NULL REFERENCES pooled_lots(id) ON DELETE CASCADE,
    farmer_user_id UUID NOT NULL REFERENCES farmers(user_id) ON DELETE RESTRICT,
    listing_id BIGINT REFERENCES crop_listings(id) ON DELETE SET NULL,
    quantity_kg NUMERIC(14, 3) NOT NULL CHECK (quantity_kg > 0),
    settlement_amount NUMERIC(14, 2) CHECK (settlement_amount IS NULL OR settlement_amount >= 0),
    settlement_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (settlement_status IN ('PENDING', 'CALCULATED', 'PAID')),
    PRIMARY KEY (lot_id, farmer_user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS market_alerts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    commodity_id BIGINT REFERENCES commodities(id) ON DELETE CASCADE,
    market_name TEXT,
    target_price_per_kg NUMERIC(14, 2) CHECK (target_price_per_kg IS NULL OR target_price_per_kg >= 0),
    alert_type TEXT NOT NULL CHECK (alert_type IN ('PRICE_TARGET', 'RECOMMENDATION_CHANGE', 'DEMAND_MATCH', 'OFFER_RECEIVED')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alert_deliveries (
    id BIGSERIAL PRIMARY KEY,
    alert_id BIGINT NOT NULL REFERENCES market_alerts(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS', 'WHATSAPP')),
    destination TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
    provider_reference TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_buyer_status ON buyer_verification_documents (buyer_user_id, status);
CREATE INDEX IF NOT EXISTS idx_pooled_lots_fpo_status ON pooled_lots (fpo_id, status);
CREATE INDEX IF NOT EXISTS idx_pooled_lot_members_farmer ON pooled_lot_members (farmer_user_id, settlement_status);
CREATE INDEX IF NOT EXISTS idx_market_alerts_active ON market_alerts (user_id, is_active, alert_type);

COMMIT;
