-- CRITICAL: Check if supplier_id is actually being saved correctly in database
-- Run this to see the actual data

-- Query 1: Show last 10 uploaded documents with their supplier_ids
SELECT 
    id,
    supplier_id,
    document_type,
    document_name,
    uploaded_at,
    verification_status
FROM supplier_documents
ORDER BY uploaded_at DESC
LIMIT 10;

-- Query 2: Count documents per supplier
SELECT 
    supplier_id,
    COUNT(*) as document_count,
    STRING_AGG(document_type, ', ') as document_types
FROM supplier_documents
GROUP BY supplier_id
ORDER BY document_count DESC;

-- Query 3: Check if there are any NULL supplier_ids
SELECT COUNT(*) as null_supplier_id_count
FROM supplier_documents
WHERE supplier_id IS NULL;

-- Query 4: Verify supplier_ids exist in profiles table
SELECT 
    sd.supplier_id,
    p.name as supplier_name,
    p.email,
    COUNT(sd.id) as doc_count
FROM supplier_documents sd
LEFT JOIN profiles p ON sd.supplier_id = p.id
GROUP BY sd.supplier_id, p.name, p.email
ORDER BY doc_count DESC;
