-- Fix existing RFQs where quote_lead_time has wrong data
-- This updates quote_lead_time to use lead_time_admin for quoted RFQs

UPDATE public.rfqs
SET quote_lead_time = lead_time_admin
WHERE status = 'Quoted'
  AND lead_time_admin IS NOT NULL
  AND (quote_lead_time IS NULL OR quote_lead_time != lead_time_admin);

-- Verify the fix
SELECT 
    rfq_number,
    status,
    lead_time_admin,
    quote_lead_time,
    quote_valid_until
FROM public.rfqs
WHERE status = 'Quoted'
ORDER BY created_at DESC;
