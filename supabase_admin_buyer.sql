-- 1. Create Admin Status Enum
DO $$ BEGIN
    CREATE TYPE admin_rfq_status AS ENUM ('New', 'Live', 'Quoted', 'Sent to Buyer', 'Approved', 'Rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add Admin Columns to RFQs Table
ALTER TABLE public.rfqs 
ADD COLUMN IF NOT EXISTS admin_status admin_rfq_status DEFAULT 'New',
ADD COLUMN IF NOT EXISTS weight_per_piece NUMERIC,
ADD COLUMN IF NOT EXISTS material_admin TEXT,
ADD COLUMN IF NOT EXISTS finish TEXT,
ADD COLUMN IF NOT EXISTS hardness TEXT,
ADD COLUMN IF NOT EXISTS lead_time_admin TEXT,
ADD COLUMN IF NOT EXISTS visibility_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 3. Enable Admin Updates
-- Existing policy might only be for SELECT. We need UPDATE.
CREATE POLICY "Admins can update all rfqs" 
ON public.rfqs 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());
