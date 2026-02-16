-- COMPLETE FIX for Realtime Chat
-- Run this entire script in Supabase SQL Editor

-- 1. Force Replica Identity to FULL
-- This ensures all columns are available in the replication stream, which is often required for updates/deletes
-- and helps ensure RLS works correctly with Realtime.
ALTER TABLE rfq_negotiations REPLICA IDENTITY FULL;

-- 2. Reset Publication Config
-- First remove the table (ignore error if not present) to ensure a clean slate
ALTER PUBLICATION supabase_realtime DROP TABLE rfq_negotiations;

-- Then add it back explicitly
ALTER PUBLICATION supabase_realtime ADD TABLE rfq_negotiations;

-- 3. Verify Grants
-- Ensure authenticated users have permission to use the table
GRANT ALL ON rfq_negotiations TO authenticated;

-- 4. Double check RLS (Should be enabled)
ALTER TABLE rfq_negotiations ENABLE ROW LEVEL SECURITY;

-- Post-Action:
-- After running this, please refresh both Buyer and Admin pages.
