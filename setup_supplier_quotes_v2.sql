-- Ensure 'supplier_quotes' has 'supplier_id' linked to profiles
-- This is needed to reliably fetch quotes for the logged-in supplier.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplier_quotes' AND column_name = 'supplier_id') THEN
        ALTER TABLE public.supplier_quotes ADD COLUMN supplier_id UUID REFERENCES public.profiles(id);
    END IF;
END $$;
