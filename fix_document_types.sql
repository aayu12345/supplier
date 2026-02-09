-- Fix document_type constraint to allow all certificate types
-- This fixes the issue where ISO Certificate and Company Capacities uploads fail

-- Drop the old constraint
ALTER TABLE supplier_documents DROP CONSTRAINT IF EXISTS supplier_documents_document_type_check;

-- Add new constraint with ALL document types
ALTER TABLE supplier_documents ADD CONSTRAINT supplier_documents_document_type_check 
    CHECK (document_type IN (
        'Transport Receipt', 
        'QC Report', 
        'GST Certificate', 
        'MSME Certificate',
        'ISO Certificate',
        'Company Capacities',
        'Company Registration', 
        'Other'
    ));
