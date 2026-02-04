-- Add parent_rfq_id column to support Parent-Child RFQ hierarchy
-- Parent RFQs will have NULL parent_rfq_id (or act as root)
-- Sub-RFQs will reference their Parent RFQ ID

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rfqs' AND column_name = 'parent_rfq_id') THEN
        ALTER TABLE public.rfqs 
        ADD COLUMN parent_rfq_id uuid REFERENCES public.rfqs(id) ON DELETE CASCADE;
    END IF;
END $$;
