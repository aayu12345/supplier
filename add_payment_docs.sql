-- Add columns for Payment Proof Documents (UTR / Payment Advice)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_payments' AND column_name = 'advance_doc_url') THEN
        ALTER TABLE public.order_payments ADD COLUMN advance_doc_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_payments' AND column_name = 'balance_doc_url') THEN
        ALTER TABLE public.order_payments ADD COLUMN balance_doc_url TEXT;
    END IF;
END $$;
