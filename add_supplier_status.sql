-- Create a separate table for supplier-specific status
-- This won't affect buyers, RFQs, or any other existing data

CREATE TABLE IF NOT EXISTS supplier_status (
    supplier_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Blacklisted')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id),
    notes TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_supplier_status_status ON supplier_status(status);

-- Add RLS policies
ALTER TABLE supplier_status ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all supplier statuses
CREATE POLICY "Admins can view all supplier statuses"
    ON supplier_status
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND 'admin' = ANY(profiles.role)
        )
    );

-- Allow admins to update supplier statuses
CREATE POLICY "Admins can update supplier statuses"
    ON supplier_status
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND 'admin' = ANY(profiles.role)
        )
    );

-- Initialize status for existing suppliers
INSERT INTO supplier_status (supplier_id, status)
SELECT id, 'Active'
FROM profiles
WHERE 'supplier' = ANY(role)
ON CONFLICT (supplier_id) DO NOTHING;
