-- Reusable crop-lot workflow built on the existing crop_listings records.

BEGIN;

ALTER TABLE crop_listings
    ADD COLUMN IF NOT EXISTS lot_code TEXT,
    ADD COLUMN IF NOT EXISTS availability_date DATE;

UPDATE crop_listings
SET lot_code = 'LOT-' || LPAD(id::text, 8, '0')
WHERE lot_code IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_crop_listings_lot_code
    ON crop_listings (lot_code)
    WHERE lot_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crop_listings_availability
    ON crop_listings (availability_date, status)
    WHERE lot_code IS NOT NULL;

COMMIT;
