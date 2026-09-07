-- Farmer/FPO profile and listing fields. Apply after 001_initial_platform_schema.sql.
-- Existing rows are preserved; no production records are inserted or deleted.

BEGIN;

ALTER TABLE farmers
    ADD COLUMN IF NOT EXISTS farming_details TEXT;

ALTER TABLE crop_listings
    ADD COLUMN IF NOT EXISTS variety TEXT,
    ADD COLUMN IF NOT EXISTS quantity_value NUMERIC(14, 3),
    ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT 'kg',
    ADD COLUMN IF NOT EXISTS expected_price_per_unit NUMERIC(14, 2),
    ADD COLUMN IF NOT EXISTS quality_details TEXT,
    ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS preferred_market_id BIGINT REFERENCES markets(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS preferred_market_name TEXT;

ALTER TABLE crop_listings DROP CONSTRAINT IF EXISTS crop_listings_status_check;
ALTER TABLE crop_listings
    ADD CONSTRAINT crop_listings_status_check CHECK (
        status IN (
            'DRAFT', 'ACTIVE', 'OFFER_RECEIVED', 'ORDERED', 'SOLD',
            'EXPIRED', 'CANCELLED', 'PUBLISHED', 'RESERVED'
        )
    );

ALTER TABLE crop_listings DROP CONSTRAINT IF EXISTS crop_listings_unit_check;
ALTER TABLE crop_listings
    ADD CONSTRAINT crop_listings_unit_check CHECK (unit IN ('kg', 'quintal', 'tonne', 'piece', 'crate'));

ALTER TABLE crop_listings DROP CONSTRAINT IF EXISTS crop_listings_expected_price_check;
ALTER TABLE crop_listings
    ADD CONSTRAINT crop_listings_expected_price_check CHECK (
        expected_price_per_unit IS NULL OR expected_price_per_unit >= 0
    );

UPDATE crop_listings
SET quantity_value = quantity_kg
WHERE quantity_value IS NULL;

ALTER TABLE crop_listings
    ALTER COLUMN quantity_value SET NOT NULL;

ALTER TABLE crop_listings DROP CONSTRAINT IF EXISTS crop_listings_quantity_value_check;
ALTER TABLE crop_listings
    ADD CONSTRAINT crop_listings_quantity_value_check CHECK (quantity_value > 0);

CREATE INDEX IF NOT EXISTS idx_crop_listings_farmer_status
    ON crop_listings (farmer_user_id, status, updated_at DESC);

COMMIT;
