-- Only create tables that DON'T already exist
-- supplier_documents already exists in setup_payments_billing.sql
-- supplier_quotes already exists in supabase_negotiation.sql
-- supplier_metrics already exists in supabase_supplier_enhanced.sql

-- 1. Create supplier_status table (NEW - doesn't exist)
CREATE TABLE IF NOT EXISTS supplier_status (
    supplier_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Blacklisted')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id),
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_supplier_status_status ON supplier_status(status);

-- 2. Create supplier_admin_notes table (NEW - doesn't exist)
CREATE TABLE IF NOT EXISTS supplier_admin_notes (
    supplier_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- 3. Add missing columns to existing profiles table if needed
DO $$
BEGIN
    -- Add company_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'company_name') THEN
        ALTER TABLE profiles ADD COLUMN company_name TEXT;
    END IF;
    
    -- Add gst_number if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'gst_number') THEN
        ALTER TABLE profiles ADD COLUMN gst_number TEXT;
    END IF;
    
    -- Add msme_number if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'msme_number') THEN
        ALTER TABLE profiles ADD COLUMN msme_number TEXT;
    END IF;
    
    -- Add address if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'address') THEN
        ALTER TABLE profiles ADD COLUMN address TEXT;
    END IF;
    
    -- Add capabilities if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'capabilities') THEN
        ALTER TABLE profiles ADD COLUMN capabilities TEXT[];
    END IF;
END $$;

-- 4. Update existing supplier_documents table to support GST/MSME certificates
-- Add new document types to the CHECK constraint
DO $$
BEGIN
    -- Drop the old constraint
    ALTER TABLE supplier_documents DROP CONSTRAINT IF EXISTS supplier_documents_document_type_check;
    
    -- Add new constraint with more document types
    ALTER TABLE supplier_documents ADD CONSTRAINT supplier_documents_document_type_check 
        CHECK (document_type IN ('Transport Receipt', 'QC Report', 'GST Certificate', 'MSME Certificate', 'Company Registration', 'Other'));
END $$;

-- 5. Enable RLS on new tables
ALTER TABLE supplier_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_admin_notes ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for supplier_status
DROP POLICY IF EXISTS "Admins can view all supplier statuses" ON supplier_status;
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

DROP POLICY IF EXISTS "Admins can manage supplier statuses" ON supplier_status;
CREATE POLICY "Admins can manage supplier statuses"
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

-- 7. RLS Policies for supplier_admin_notes
DROP POLICY IF EXISTS "Admins can view all supplier notes" ON supplier_admin_notes;
CREATE POLICY "Admins can view all supplier notes"
    ON supplier_admin_notes
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND 'admin' = ANY(profiles.role)
        )
    );

DROP POLICY IF EXISTS "Admins can manage supplier notes" ON supplier_admin_notes;
CREATE POLICY "Admins can manage supplier notes"
    ON supplier_admin_notes
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND 'admin' = ANY(profiles.role)
        )
    );

-- 8. Initialize status for existing suppliers
INSERT INTO supplier_status (supplier_id, status)
SELECT id, 'Active'
FROM profiles
WHERE 'supplier' = ANY(role)
ON CONFLICT (supplier_id) DO NOTHING;
