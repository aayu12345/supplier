-- Fix Row Level Security for supplier_documents table
-- This ensures each supplier can ONLY see their own documents

-- 1. Enable RLS on supplier_documents if not already enabled
ALTER TABLE supplier_documents ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any (to recreate them correctly)
DROP POLICY IF EXISTS "Suppliers can view own documents" ON supplier_documents;
DROP POLICY IF EXISTS "Suppliers can insert own documents" ON supplier_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON supplier_documents;
DROP POLICY IF EXISTS "Admins can update all documents" ON supplier_documents;

-- 3. Create policy for suppliers to view ONLY their own documents
CREATE POLICY "Suppliers can view own documents"
ON supplier_documents
FOR SELECT
TO authenticated
USING (
    supplier_id = auth.uid()
);

-- 4. Create policy for suppliers to insert ONLY their own documents
CREATE POLICY "Suppliers can insert own documents"
ON supplier_documents
FOR INSERT
TO authenticated
WITH CHECK (
    supplier_id = auth.uid()
);

-- 5. Create policy for admins to view ALL documents
CREATE POLICY "Admins can view all documents"
ON supplier_documents
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- 6. Create policy for admins to update ALL documents (for verification)
CREATE POLICY "Admins can update all documents"
ON supplier_documents
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- 7. Verify RLS is working
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'supplier_documents';
