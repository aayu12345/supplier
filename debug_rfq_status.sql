-- Debug Query: Check RFQ Status and Quotes
-- Run this to see what's actually in the database

-- 1. Check the RFQ that was just quoted
SELECT 
    id,
    rfq_number,
    admin_status,
    created_at
FROM public.rfqs
WHERE admin_status IN ('Live', 'Quoted')
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check recent supplier quotes
SELECT 
    sq.id,
    sq.rfq_id,
    sq.supplier_name,
    sq.price,
    sq.status,
    sq.created_at,
    r.rfq_number,
    r.admin_status as rfq_admin_status
FROM public.supplier_quotes sq
LEFT JOIN public.rfqs r ON r.id = sq.rfq_id
ORDER BY sq.created_at DESC
LIMIT 10;

-- 3. Check current RLS policies on rfqs table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'rfqs'
ORDER BY policyname;
