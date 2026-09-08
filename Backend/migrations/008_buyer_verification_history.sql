-- Extend the existing buyer verification workflow with upload metadata and immutable review history.

BEGIN;

ALTER TABLE buyer_verification_documents
    ADD COLUMN IF NOT EXISTS document_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

CREATE TABLE IF NOT EXISTS buyer_verification_reviews (
    id BIGSERIAL PRIMARY KEY,
    buyer_user_id UUID NOT NULL REFERENCES buyers(user_id) ON DELETE CASCADE,
    document_id BIGINT REFERENCES buyer_verification_documents(id) ON DELETE SET NULL,
    previous_status TEXT,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    rejection_reason TEXT,
    review_note TEXT,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buyer_verification_reviews_buyer
    ON buyer_verification_reviews (buyer_user_id, created_at DESC);

COMMIT;
