-- Fix existing approved quotes to appear in admin's Approved tab
-- This updates admin_status for quotes that buyers have already approved

UPDATE public.rfqs
SET admin_status = 'Approved'
WHERE status = 'Approved'
  AND (admin_status IS NULL OR admin_status != 'Approved');

-- Verify the fix
SELECT 
    rfq_number,
    status,
    admin_status,
    updated_at
FROM public.rfqs
WHERE status = 'Approved'
ORDER BY updated_at DESC;
