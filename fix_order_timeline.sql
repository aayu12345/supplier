-- FINAL FIX: Recreate order_timeline table with proper relationship
-- This fixes the PGRST200 error about missing relationship

-- 1. Drop existing order_timeline if it exists (to start fresh)
DROP TABLE IF EXISTS public.order_timeline CASCADE;

-- 2. Recreate order_timeline with proper foreign key
CREATE TABLE public.order_timeline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    stage TEXT,
    description TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    visible_to_buyer BOOLEAN DEFAULT FALSE,
    
    step_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    attachment_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;

-- 4. Create policy
DROP POLICY IF EXISTS "Timeline access for auth users" ON public.order_timeline;
CREATE POLICY "Timeline access for auth users" 
    ON public.order_timeline 
    FOR ALL 
    USING (auth.role() = 'authenticated');

-- 5. Verify the relationship exists (this will show in query results)
SELECT 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='order_timeline';
