-- Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rfq_id UUID REFERENCES public.rfqs(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.profiles(id), -- Linked to the buyer profile
    order_number TEXT NOT NULL, -- e.g. "ORD-2026-1052"
    status TEXT DEFAULT 'In Progress', -- 'In Progress', 'Completed', 'Cancelled'
    
    -- Financials
    currency TEXT DEFAULT 'USD',
    total_value NUMERIC,
    
    -- Documents (URLs)
    po_url TEXT,
    pi_url TEXT,
    final_quote_url TEXT,
    dispatch_url TEXT, -- For completed orders

    -- Dates
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create Order Timeline Table
CREATE TABLE IF NOT EXISTS public.order_timeline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL, -- e.g. "Material Ordered"
    description TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')), -- Admin approval status
    visible_to_buyer BOOLEAN DEFAULT FALSE, -- Admin control
    
    -- Metadata
    step_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    attachment_url TEXT, -- Optional image/doc
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies (Simple for now: Admin all access, Buyer own items)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;

-- Admin Policy (Assuming role='admin' in profiles or handled via app logic for now, keeping it open for dev)
CREATE POLICY "Enable all access for authenticated users" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON public.order_timeline FOR ALL USING (auth.role() = 'authenticated');
