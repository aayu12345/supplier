-- Add missing columns to 'rfqs' table to support Sub-RFQ (Single Item) structure
-- Sub-RFQs act as individual RFQs, so they need these fields directly on the main table.

DO $$
BEGIN
    -- 1. Drawing Number (Critical for Sub-RFQs)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rfqs' AND column_name = 'drawing_number') THEN
        ALTER TABLE public.rfqs ADD COLUMN drawing_number text;
    END IF;

    -- 2. Quantity (Should exist, but safety check)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rfqs' AND column_name = 'quantity') THEN
        ALTER TABLE public.rfqs ADD COLUMN quantity text;
    END IF;

    -- 3. Target Price (Should exist, but safety check)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rfqs' AND column_name = 'target_price') THEN
        ALTER TABLE public.rfqs ADD COLUMN target_price numeric;
    END IF;

    -- 4. Lead Time (Should exist, but safety check)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rfqs' AND column_name = 'lead_time') THEN
        ALTER TABLE public.rfqs ADD COLUMN lead_time text;
    END IF;

END $$;
