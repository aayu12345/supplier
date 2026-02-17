-- Add Quote Expiry Date to RFQs table
-- This field tracks the deadline for suppliers to submit their quotes.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rfqs' AND column_name = 'quote_expiry_date') THEN
        ALTER TABLE public.rfqs ADD COLUMN quote_expiry_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
