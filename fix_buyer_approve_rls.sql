-- Fix RLS Policy: Allow Buyers to Approve Their Own Quotes
-- This enables buyers to update status from 'Quoted' to 'Approved'

-- Drop existing buyer update policy if it exists
DROP POLICY IF EXISTS "Buyers can approve their quotes" ON public.rfqs;

-- Create policy to allow buyers to approve quotes
CREATE POLICY "Buyers can approve their quotes"
ON public.rfqs
FOR UPDATE
USING (
    user_id = auth.uid() 
    AND status = 'Quoted'  -- Only allow update when status is Quoted
)
WITH CHECK (
    user_id = auth.uid()
    AND status = 'Approved'  -- Only allow changing to Approved
    AND admin_status = 'Approved'  -- Also require admin_status to be Approved
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
  AND policyname LIKE '%Buyers%'
ORDER BY policyname;
