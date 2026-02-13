-- Simple script to add Negotiation status
-- Run this SINGLE LINE in Supabase SQL Editor:

ALTER TYPE admin_rfq_status ADD VALUE IF NOT EXISTS 'Negotiation';

-- That's it! Click "Run" and wait for success message.
-- Then refresh your browser and try the Negotiate button again.
