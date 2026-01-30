-- Add columns for Quote/Offer details
alter table public.rfqs 
add column if not exists quote_price numeric,
add column if not exists quote_lead_time text,
add column if not exists quote_valid_until date,
add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

-- Update the RFQs table to allow "Quoted" status
-- (Already text, so no change needed, just usage)

-- Seed some mock data for demonstration if needed
-- (Optional, can be done manually or via a separate script)
