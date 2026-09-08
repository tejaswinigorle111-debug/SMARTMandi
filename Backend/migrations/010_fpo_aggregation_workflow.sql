-- FPO-owned aggregation workflow built on existing FPO, membership, pooled-lot, and offer records.

BEGIN;

ALTER TABLE fpos
    ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE pooled_lots
    ADD COLUMN IF NOT EXISTS quality_standard TEXT,
    ADD COLUMN IF NOT EXISTS quality_notes TEXT,
    ADD COLUMN IF NOT EXISTS quality_standardized_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS quality_standardized_at TIMESTAMPTZ;

ALTER TABLE offers
    ADD COLUMN IF NOT EXISTS pooled_lot_id BIGINT REFERENCES pooled_lots(id) ON DELETE SET NULL;

ALTER TABLE offers
    ALTER COLUMN listing_id DROP NOT NULL;

CREATE TABLE IF NOT EXISTS pooled_lot_quality_reviews (
    id BIGSERIAL PRIMARY KEY,
    pooled_lot_id BIGINT NOT NULL REFERENCES pooled_lots(id) ON DELETE CASCADE,
    quality_grade TEXT NOT NULL,
    quality_standard TEXT NOT NULL,
    notes TEXT,
    reviewed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pooled_lot_settlements (
    id BIGSERIAL PRIMARY KEY,
    pooled_lot_id BIGINT NOT NULL REFERENCES pooled_lots(id) ON DELETE CASCADE,
    offer_id BIGINT NOT NULL REFERENCES offers(id) ON DELETE RESTRICT,
    farmer_user_id UUID NOT NULL REFERENCES farmers(user_id) ON DELETE RESTRICT,
    contributed_quantity_kg NUMERIC(14, 3) NOT NULL CHECK (contributed_quantity_kg > 0),
    total_lot_quantity_kg NUMERIC(14, 3) NOT NULL CHECK (total_lot_quantity_kg > 0),
    settlement_amount NUMERIC(14, 2) NOT NULL CHECK (settlement_amount >= 0),
    status TEXT NOT NULL DEFAULT 'CALCULATED' CHECK (status IN ('CALCULATED', 'PAID')),
    calculated_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (pooled_lot_id, offer_id, farmer_user_id)
);

CREATE INDEX IF NOT EXISTS idx_fpos_owner ON fpos (owner_user_id);
CREATE INDEX IF NOT EXISTS idx_offers_pooled_lot ON offers (pooled_lot_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pooled_lot_settlements_lot ON pooled_lot_settlements (pooled_lot_id, status);

COMMIT;
