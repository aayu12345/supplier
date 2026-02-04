-- COMPLETE SETUP FOR ORDERS & SUPPLIER QUOTES
-- Run this to fix any "relation does not exist" or missing column errors.

-- 1. Ensure ORDERS table exists with all columns
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rfq_id UUID REFERENCES public.rfqs(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.profiles(id),
    supplier_id UUID REFERENCES public.profiles(id), -- Added directly in creation
    order_number TEXT NOT NULL,
    status TEXT DEFAULT 'In Progress',
    
    -- Financials
    currency TEXT DEFAULT 'USD',
    total_value NUMERIC,
    
    -- Documents
    po_url TEXT,
    pi_url TEXT,
    final_quote_url TEXT,
    dispatch_url TEXT,
    
    -- Dates
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 1b. Add supplier_id if table existed but column was missing (Idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'supplier_id') THEN
        ALTER TABLE public.orders ADD COLUMN supplier_id UUID REFERENCES public.profiles(id);
    END IF;
END $$;


-- 2. Ensure ORDER TIMELINE table exists
CREATE TABLE IF NOT EXISTS public.order_timeline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    stage TEXT, -- Added directly
    description TEXT,
    status TEXT DEFAULT 'Pending',
    visible_to_buyer BOOLEAN DEFAULT FALSE,
    step_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2b. Add columns if timeline existed from older version
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_timeline' AND column_name = 'stage') THEN
        ALTER TABLE public.order_timeline ADD COLUMN stage TEXT;
    END IF;
END $$;


-- 3. Ensure SUPPLIER_QUOTES has supplier_id
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'supplier_quotes' AND column_name = 'supplier_id') THEN
        ALTER TABLE public.supplier_quotes ADD COLUMN supplier_id UUID REFERENCES public.profiles(id);
    END IF;
END $$;


-- 4. Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;

-- 5. Policies (Drop first to avoid errors)
DROP POLICY IF EXISTS "Orders access for auth users" ON public.orders;
CREATE POLICY "Orders access for auth users" ON public.orders FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Timeline access for auth users" ON public.order_timeline;
CREATE POLICY "Timeline access for auth users" ON public.order_timeline FOR ALL USING (auth.role() = 'authenticated');
