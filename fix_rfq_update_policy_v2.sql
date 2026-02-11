-- Fix RLS Policy for Suppliers to Update RFQ Status
-- The issue: WITH CHECK clause is too restrictive

-- Drop the existing policy
DROP POLICY IF EXISTS "Suppliers can update RFQ status when quoting" ON public.rfqs;

-- Create a new policy that allows authenticated users to update Live RFQs to Quoted
CREATE POLICY "Suppliers can update RFQ status when quoting" 
ON public.rfqs
FOR UPDATE
USING (
    -- Can only update RFQs that are currently Live
    -- AND user must be authenticated
    admin_status = 'Live' AND auth.uid() IS NOT NULL
)
WITH CHECK (
    -- After update, status must be 'Quoted'
    admin_status = 'Quoted'
);

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
