-- Allow buyers and admins to insert and view negotiation messages
-- This enables the two-way chat functionality

-- First, check existing policies on rfq_negotiations table (optional)
-- SELECT * FROM pg_policies WHERE tablename = 'rfq_negotiations';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Buyers can insert negotiation messages" ON rfq_negotiations;
DROP POLICY IF EXISTS "Buyers can view their negotiation messages" ON rfq_negotiations;
DROP POLICY IF EXISTS "Admins can insert negotiation messages" ON rfq_negotiations;
DROP POLICY IF EXISTS "Admins can view all negotiation messages" ON rfq_negotiations;

-- Policy 1: Allow buyers to insert their own messages
CREATE POLICY "Buyers can insert negotiation messages"
ON rfq_negotiations
FOR INSERT
TO authenticated
WITH CHECK (
    sender_role = 'buyer'
    AND EXISTS (
        SELECT 1 FROM rfqs
        WHERE rfqs.id = rfq_negotiations.rfq_id
        AND rfqs.user_id = auth.uid()
    )
);

-- Policy 2: Allow buyers to view negotiation messages for their RFQs
CREATE POLICY "Buyers can view their negotiation messages"
ON rfq_negotiations
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM rfqs
        WHERE rfqs.id = rfq_negotiations.rfq_id
        AND rfqs.user_id = auth.uid()
    )
);

-- Policy 3: Allow admins to insert negotiation messages
CREATE POLICY "Admins can insert negotiation messages"
ON rfq_negotiations
FOR INSERT
TO authenticated
WITH CHECK (
    sender_role = 'admin'
);

-- Policy 4: Allow admins to view all negotiation messages
CREATE POLICY "Admins can view all negotiation messages"
ON rfq_negotiations
FOR SELECT
TO authenticated
USING (
    sender_role = 'admin' OR sender_role = 'buyer'
);

-- Note: Run this entire script in Supabase SQL Editor
