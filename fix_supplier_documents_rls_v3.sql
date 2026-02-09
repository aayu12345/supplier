-- FINAL FIX: RLS Policies for supplier_documents
-- This ensures Suppliers see ONLY their own docs, but Admins see ALL docs.

-- 1. Enable RLS
ALTER TABLE supplier_documents ENABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Suppliers can view own documents" ON supplier_documents;
DROP POLICY IF EXISTS "Suppliers can insert own documents" ON supplier_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON supplier_documents;
DROP POLICY IF EXISTS "Admins can update all documents" ON supplier_documents;
DROP POLICY IF EXISTS "Service role can do anything" ON supplier_documents;

-- 3. Policy: Suppliers can view ONLY their own documents
CREATE POLICY "Suppliers can view own documents"
ON supplier_documents
FOR SELECT
TO authenticated
USING (
    supplier_id = auth.uid()
);

-- 4. Policy: Suppliers can insert ONLY their own documents
CREATE POLICY "Suppliers can insert own documents"
ON supplier_documents
FOR INSERT
TO authenticated
WITH CHECK (
    supplier_id = auth.uid()
);

-- 5. Policy: Admins can view ALL documents
-- We check if the user has 'admin' in their roles array
CREATE POLICY "Admins can view all documents"
ON supplier_documents
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND 'admin' = ANY(profiles.role)
    )
);

-- 6. Policy: Admins can update ALL documents (for verification)
CREATE POLICY "Admins can update all documents"
ON supplier_documents
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND 'admin' = ANY(profiles.role)
    )
);

-- 7. Policy: Service Role (superuser) can do anything
CREATE POLICY "Service role can do anything"
ON supplier_documents
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 8. Verify the policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'supplier_documents'
ORDER BY policyname;
