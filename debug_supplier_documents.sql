-- EMERGENCY FIX: Check and fix supplier_documents data
-- This will show us what's actually in the database

-- 1. First, let's see ALL documents and their supplier_ids
SELECT 
    id,
    supplier_id,
    document_type,
    document_name,
    verification_status,
    uploaded_at
FROM supplier_documents
ORDER BY uploaded_at DESC
LIMIT 20;

-- 2. Check if supplier_id matches actual user IDs in profiles
SELECT 
    sd.id as doc_id,
    sd.supplier_id,
    sd.document_type,
    p.name as supplier_name,
    p.email as supplier_email
FROM supplier_documents sd
LEFT JOIN profiles p ON sd.supplier_id = p.id
ORDER BY sd.uploaded_at DESC
LIMIT 20;

-- 3. Find documents with mismatched supplier_ids (if any)
SELECT 
    sd.id,
    sd.supplier_id,
    sd.document_type,
    COUNT(*) as count
FROM supplier_documents sd
GROUP BY sd.supplier_id, sd.document_type, sd.id
HAVING COUNT(*) > 1;

-- 4. Check if there are duplicate supplier_ids
SELECT 
    supplier_id,
    COUNT(*) as document_count,
    STRING_AGG(document_type, ', ') as document_types
FROM supplier_documents
GROUP BY supplier_id
ORDER BY document_count DESC;
