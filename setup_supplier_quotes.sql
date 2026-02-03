-- Ensure supplier_quotes table exists with correct schema
-- Run this in Supabase SQL Editor

-- Drop and recreate the table to ensure correct schema
DROP TABLE IF EXISTS public.supplier_quotes CASCADE;

CREATE TABLE public.supplier_quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rfq_id UUID REFERENCES public.rfqs(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES auth.users(id),
    supplier_name TEXT,
    price NUMERIC NOT NULL,
    lead_time TEXT,
    remarks TEXT,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.supplier_quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Suppliers can view own quotes" ON public.supplier_quotes
FOR SELECT USING (supplier_id = auth.uid());

CREATE POLICY "Suppliers can insert own quotes" ON public.supplier_quotes
FOR INSERT WITH CHECK (supplier_id = auth.uid());

CREATE POLICY "Admins can manage all quotes" ON public.supplier_quotes
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);
