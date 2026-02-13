-- Check the LATEST approved quote to verify if admin_status is being set correctly
-- Run this AFTER approving a new quote from buyer dashboard

SELECT 
    rfq_number,
    status,
    admin_status,
    quote_price,
    updated_at,
    created_at,
    CASE 
        WHEN admin_status = 'Approved' THEN '✅ CORRECT - Should appear in admin Approved tab'
        WHEN admin_status IS NULL THEN '❌ BROKEN - admin_status is NULL (code not working)'
        ELSE '⚠️ WRONG VALUE - admin_status = ' || admin_status
    END as diagnosis
FROM public.rfqs
WHERE status = 'Approved'
ORDER BY updated_at DESC
LIMIT 5;

-- Also check if there are any RFQs approved in the last 10 minutes
SELECT 
    rfq_number,
    status,
    admin_status,
    updated_at,
    NOW() - updated_at as time_since_approval
FROM public.rfqs
WHERE status = 'Approved'
  AND updated_at > NOW() - INTERVAL '10 minutes'
ORDER BY updated_at DESC;
