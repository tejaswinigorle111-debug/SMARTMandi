-- Transaction completion metadata. Provider-confirmed states remain unavailable until webhook integration is configured.

BEGIN;

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS receipt_reference TEXT,
    ADD COLUMN IF NOT EXISTS receipt_url TEXT,
    ADD COLUMN IF NOT EXISTS refund_reference TEXT,
    ADD COLUMN IF NOT EXISTS webhook_confirmed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_payment_events_payment_created
    ON payment_events (payment_id, created_at DESC);

COMMIT;
