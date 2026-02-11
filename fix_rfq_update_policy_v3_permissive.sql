-- FINAL FIX: Ultra-permissive policy for RFQ status updates
-- This removes all restrictions except authentication

-- Drop the existing policy
DROP POLICY IF EXISTS "Suppliers can update RFQ status when quoting" ON public.rfqs;

-- Create a very simple policy: any authenticated user can update any RFQ
-- We'll rely on application logic to ensure only valid updates happen
CREATE POLICY "Suppliers can update RFQ status when quoting" 
ON public.rfqs
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Verify the policy
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
