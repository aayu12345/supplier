-- Update RLS policy to allow buyers to update both status and admin_status fields

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Buyers can update RFQ to Negotiation status" ON rfqs;

-- Create new policy allowing buyers to update both status and admin_status
CREATE POLICY "Buyers can update RFQ to Negotiation"
ON rfqs
FOR UPDATE
TO authenticated
USING (
    auth.uid() = user_id
)
WITH CHECK (
    auth.uid() = user_id
);

-- This allows buyers to update their own RFQs
-- The application logic controls what values can be set
