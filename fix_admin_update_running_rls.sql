-- Fix: Allow Admin to Update RFQ Status to Running
-- Problem: Admin cannot update admin_status from 'Approved' to 'Running'
-- Solution: Add RLS policy for admin to update RFQs

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'rfqs' AND cmd = 'UPDATE';

-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "Admins can update RFQs to Running" ON public.rfqs;

-- Create new policy allowing admin to update RFQs
CREATE POLICY "Admins can update RFQs to Running"
ON public.rfqs
FOR UPDATE
USING (
    -- Admin can update any RFQ
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND 'admin' = ANY(profiles.role)
    )
)
WITH CHECK (
    -- Admin can set any status
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND 'admin' = ANY(profiles.role)
    )
);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'rfqs' AND policyname = 'Admins can update RFQs to Running';
