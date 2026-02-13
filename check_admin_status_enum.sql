-- Diagnostic Script: Check admin_status ENUM values
-- This will show what values are allowed for admin_status column

-- 1. Check the ENUM type definition
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value,
    e.enumsortorder as sort_order
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'admin_rfq_status'
ORDER BY e.enumsortorder;

-- 2. Check the column definition for rfqs table
SELECT 
    column_name, 
    data_type, 
    udt_name
FROM information_schema.columns
WHERE table_name = 'rfqs' 
AND column_name = 'admin_status';

-- 3. Check current admin_status values in use
SELECT 
    admin_status, 
    COUNT(*) as count
FROM rfqs
GROUP BY admin_status
ORDER BY count DESC;

-- 4. If "Running" is not in the enum, we need to add it
-- Run this ONLY if "Running" is missing from the enum:
-- ALTER TYPE admin_rfq_status ADD VALUE 'Running';

-- 5. Alternative: Check if there's a different value we should use
-- Maybe it's "Live Running" or "In Progress" or something else?
