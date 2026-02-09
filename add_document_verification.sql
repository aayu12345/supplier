-- Add Document Verification and Expiry Date Tracking
-- This enables admin verification workflow and expiry date management

-- 1. Add new columns to supplier_documents table
ALTER TABLE supplier_documents 
ADD COLUMN IF NOT EXISTS expiry_date DATE,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'Pending' 
    CHECK (verification_status IN ('Pending', 'Verified', 'Rejected')),
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_supplier_documents_verification 
    ON supplier_documents(verification_status);
    
CREATE INDEX IF NOT EXISTS idx_supplier_documents_expiry 
    ON supplier_documents(expiry_date);

-- 3. Update existing documents to 'Pending' status
UPDATE supplier_documents 
SET verification_status = 'Pending' 
WHERE verification_status IS NULL;

-- 4. Create a view for expiring documents (< 30 days)
CREATE OR REPLACE VIEW expiring_documents AS
SELECT 
    sd.*,
    p.name as supplier_name,
    p.email as supplier_email,
    (sd.expiry_date - CURRENT_DATE) as days_until_expiry
FROM supplier_documents sd
JOIN profiles p ON sd.supplier_id = p.id
WHERE sd.expiry_date IS NOT NULL
  AND sd.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
  AND sd.expiry_date >= CURRENT_DATE
ORDER BY sd.expiry_date ASC;

-- 5. Verification query
SELECT 
    'Total Documents' as metric,
    COUNT(*) as count
FROM supplier_documents
UNION ALL
SELECT 
    'Pending Verification',
    COUNT(*)
FROM supplier_documents
WHERE verification_status = 'Pending'
UNION ALL
SELECT 
    'Verified',
    COUNT(*)
FROM supplier_documents
WHERE verification_status = 'Verified'
UNION ALL
SELECT 
    'Rejected',
    COUNT(*)
FROM supplier_documents
WHERE verification_status = 'Rejected'
UNION ALL
SELECT 
    'Expiring Soon (< 30 days)',
    COUNT(*)
FROM supplier_documents
WHERE expiry_date IS NOT NULL
  AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'
  AND expiry_date >= CURRENT_DATE;
