-- Fix relationships for quote_activities

-- 1. Change rfq_id to UUID (if it's not already) to match rfqs type usually
-- Note: This might fail if there are non-UUID values. Assuming current data is clean/UUIDs.
ALTER TABLE quote_activities
ALTER COLUMN rfq_id TYPE UUID USING rfq_id::UUID;

-- 2. Add Foreign Key to RFQs
ALTER TABLE quote_activities
ADD CONSTRAINT fk_quote_activities_rfq
FOREIGN KEY (rfq_id)
REFERENCES rfqs(id)
ON DELETE CASCADE;

-- 3. Just in case, let's fix quote_id too if we can, but rfq_id is priority.
-- Assuming supplier_quotes table uses UUID id.
ALTER TABLE quote_activities
ALTER COLUMN quote_id TYPE UUID USING quote_id::UUID;

ALTER TABLE quote_activities
ADD CONSTRAINT fk_quote_activities_quote
FOREIGN KEY (quote_id)
REFERENCES supplier_quotes(id)
ON DELETE SET NULL;
