-- Add 'Negotiation' status to admin_rfq_status enum
-- This allows RFQs to have a separate status when buyer and admin are actively negotiating

-- IMPORTANT: This must be run in a separate transaction
-- If running in Supabase SQL Editor, run each command separately

-- Step 1: Check current enum values (optional)
-- SELECT unnest(enum_range(NULL::admin_rfq_status));

-- Step 2: Add new value 'Negotiation' to the enum
-- Run this command ALONE, then wait for it to complete before using the new value
ALTER TYPE admin_rfq_status ADD VALUE IF NOT EXISTS 'Negotiation';

-- Step 3: Verify the new value was added (run this AFTER step 2 completes)
-- SELECT unnest(enum_range(NULL::admin_rfq_status));

-- The enum should now include: New, Live, Quoted, Sent to Buyer, Negotiation, Approved, Rejected, etc.

-- Note: After adding the enum value, you may need to refresh your database connection
-- before the new value can be used in INSERT/UPDATE statements.
