-- Create Quote Activities Table
CREATE TABLE IF NOT EXISTS quote_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rfq_id TEXT, -- Can be UUID or string depending on your RFQ table, keeping generic for now
    quote_id TEXT, -- Same here
    supplier_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL, -- RFQ_ASSIGNED, QUOTE_SUBMITTED, etc.
    description TEXT NOT NULL,
    performed_by UUID REFERENCES profiles(id), -- Who did this? Admin or Supplier
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE quote_activities ENABLE ROW LEVEL SECURITY;

-- 1. Suppliers can view their own activities
CREATE POLICY "Suppliers can view own activities"
ON quote_activities
FOR SELECT
TO authenticated
USING (
    supplier_id = auth.uid()
);

-- 2. Admins can view ALL activities
CREATE POLICY "Admins can view all activities"
ON quote_activities
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND 'admin' = ANY(profiles.role)
    )
);

-- 3. Admins can insert activities
CREATE POLICY "Admins can insert activities"
ON quote_activities
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND 'admin' = ANY(profiles.role)
    )
    OR
    supplier_id = auth.uid() -- Suppliers can insert their own actions (e.g. submit quote)
);

-- 4. Service Role can do anything
CREATE POLICY "Service role can manage activities"
ON quote_activities
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_quote_activities_supplier_id ON quote_activities(supplier_id);
CREATE INDEX IF NOT EXISTS idx_quote_activities_created_at ON quote_activities(created_at);
