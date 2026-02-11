-- Fix RLS Policy to Allow Suppliers to Update RFQ Status to 'Quoted'
-- This allows the quote submission to update the RFQ admin_status

-- Drop the existing policy if it exists
DROP POLICY IF EXISTS "Suppliers can update RFQ status when quoting" ON public.rfqs;

-- Create a new policy that allows authenticated users (suppliers) to update 
-- the admin_status field from 'Live' to 'Quoted'
CREATE POLICY "Suppliers can update RFQ status when quoting" 
ON public.rfqs
FOR UPDATE
USING (
    -- Only allow updating RFQs that are currently Live
    admin_status = 'Live'
)
WITH CHECK (
    -- Only allow changing status to 'Quoted'
    admin_status = 'Quoted'
);

-- Verify the policy was created
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
AND policyname = 'Suppliers can update RFQ status when quoting';
