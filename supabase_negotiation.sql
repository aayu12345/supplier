-- 1. Create Supplier Quotes Table
CREATE TABLE IF NOT EXISTS public.supplier_quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rfq_id UUID REFERENCES public.rfqs(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES auth.users(id), -- Nullable if we mock or have external suppliers
    supplier_name TEXT, -- For quick display if no profile link
    price NUMERIC NOT NULL,
    lead_time TEXT,
    remarks TEXT,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Selected', 'Rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Negotiation History Table
CREATE TABLE IF NOT EXISTS public.rfq_negotiations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rfq_id UUID REFERENCES public.rfqs(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL, -- 'admin', 'buyer'
    price NUMERIC, -- The price proposed in this message
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Add Columns to RFQs for Active State and Orders
ALTER TABLE public.rfqs
ADD COLUMN IF NOT EXISTS quote_price NUMERIC, -- The currently active price offered to buyer
ADD COLUMN IF NOT EXISTS quote_lead_time TEXT,
ADD COLUMN IF NOT EXISTS pi_url TEXT,
ADD COLUMN IF NOT EXISTS po_url TEXT;

-- 4. RLS Policies
ALTER TABLE public.supplier_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_negotiations ENABLE ROW LEVEL SECURITY;

-- Admin Access
CREATE POLICY "Admins can manage quotes" ON public.supplier_quotes USING (is_admin());
CREATE POLICY "Admins can manage negotiations" ON public.rfq_negotiations USING (is_admin());

-- Buyer Access (Negotiations only, they typically don't see raw supplier quotes directly, only the admin's offer)
CREATE POLICY "Buyers can view negotiations for own RFQs" ON public.rfq_negotiations
FOR SELECT USING (
    EXISTS (SELECT 1 FROM rfqs WHERE rfqs.id = rfq_negotiations.rfq_id AND rfqs.user_id = auth.uid())
);

CREATE POLICY "Buyers can insert negotiations for own RFQs" ON public.rfq_negotiations
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM rfqs WHERE rfqs.id = rfq_negotiations.rfq_id AND rfqs.user_id = auth.uid())
);
