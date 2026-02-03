-- 1. Supplier Metrics Extension
-- Linked 1:1 with public.profiles. Stores dynamic dashboard stats.
CREATE TABLE IF NOT EXISTS public.supplier_metrics (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Left Box: Key Stats
    total_rfqs_count INT DEFAULT 0, -- Active RFQs available
    orders_in_process_count INT DEFAULT 0,
    orders_completed_count INT DEFAULT 0,

    -- Right Box: Performance
    trust_score NUMERIC DEFAULT 0.0, -- Scale 0.0 to 5.0
    
    -- "Bars": Stored as JSON for flexibility
    -- Structure: {"timing": 80, "quality": 90, "packaging": 70, "communication": 95} (Percentage)
    performance_ratings JSONB DEFAULT '{"timing": 0, "quality": 0, "packaging": 0, "communication": 0}'::jsonb,
    
    -- Motivational Tip
    current_tip TEXT DEFAULT 'Maintain 95% on-time delivery to qualify for advance payments.',

    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Production Updates Table 
-- Mandatory workflow for "Orders in Process"
CREATE TABLE IF NOT EXISTS public.production_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    
    stage TEXT NOT NULL, -- e.g. "Machining", "Finishing"
    status TEXT DEFAULT 'On Time' CHECK (status IN ('On Time', 'Delayed', 'Ahead')),
    remarks TEXT,
    
    -- Evidence
    media_urls TEXT[], -- Photos/Videos
    
    -- Admin Control
    admin_approved BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.supplier_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_updates ENABLE ROW LEVEL SECURITY;

-- 4. Policies

-- Metrics: Use helper wrapper or allow read for now
CREATE POLICY "Suppliers view own metrics" ON public.supplier_metrics 
    FOR SELECT USING (auth.uid() = id);

-- Updates: Suppliers create/view for their orders; Buyers view if approved
-- (Simplified for initial dev: Authenticated users can read)
CREATE POLICY "Auth users view updates" ON public.production_updates 
    FOR SELECT USING (auth.role() = 'authenticated');
    
CREATE POLICY "Suppliers insert updates" ON public.production_updates 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Auto-create metrics row for new suppliers
CREATE OR REPLACE FUNCTION public.handle_new_supplier_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- If user is supplier, create empty metrics row
    IF 'supplier' = ANY(NEW.role) THEN
        INSERT INTO public.supplier_metrics (id) VALUES (NEW.id)
        ON CONFLICT (id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to profiles
DROP TRIGGER IF EXISTS on_supplier_created_metrics ON public.profiles;
CREATE TRIGGER on_supplier_created_metrics
    AFTER INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_supplier_metrics();
