-- Logistics rates for named transport and warehouse workflows.

BEGIN;

ALTER TABLE warehouses
    ADD COLUMN IF NOT EXISTS storage_rate_per_kg NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (storage_rate_per_kg >= 0);

ALTER TABLE shipments
    ADD COLUMN IF NOT EXISTS transport_rate_per_kg NUMERIC(14, 2) CHECK (transport_rate_per_kg IS NULL OR transport_rate_per_kg >= 0);

COMMIT;
