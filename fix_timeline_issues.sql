-- Enable Realtime for quote_activities
BEGIN;

-- 1. Ensure table exists (idempotent)
CREATE TABLE IF NOT EXISTS quote_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rfq_id TEXT,
    quote_id TEXT,
    supplier_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL,
    description TEXT NOT NULL,
    performed_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Explicitly Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE quote_activities;

-- 3. Reset RLS Policies to be safe
ALTER TABLE quote_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Suppliers can view own activities" ON quote_activities;
DROP POLICY IF EXISTS "Admins can view all activities" ON quote_activities;
DROP POLICY IF EXISTS "Admins can insert activities" ON quote_activities;
DROP POLICY IF EXISTS "Service role can manage activities" ON quote_activities;

-- Policy: Suppliers can view own
CREATE POLICY "Suppliers can view own activities"
ON quote_activities
FOR SELECT
TO authenticated
USING (
    supplier_id = auth.uid()
);

-- Policy: Admins can view ALL (Simplified check to avoid array issues if possible, but keeping array check as primary)
-- We check if 'admin' is in the array OR if role is just 'admin' text
CREATE POLICY "Admins can view all activities"
ON quote_activities
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND (
            'admin' = ANY(profiles.role) 
            OR 
            profiles.role::text = 'admin' 
            OR 
            profiles.role::text LIKE '%admin%'
        )
    )
);

-- Policy: Admins can insert
CREATE POLICY "Admins can insert activities"
ON quote_activities
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND (
            'admin' = ANY(profiles.role) 
            OR 
            profiles.role::text = 'admin'
             OR 
            profiles.role::text LIKE '%admin%'
        )
    )
    OR
    supplier_id = auth.uid()
);

-- Policy: Service Role
CREATE POLICY "Service role can manage activities"
ON quote_activities
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMIT;
