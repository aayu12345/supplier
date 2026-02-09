-- Check if any data exists in quote_activities
SELECT * FROM quote_activities;

-- Check if any data exists for a specific supplier (you can replace the ID if known, or just see all)
SELECT 
    qa.id, 
    qa.activity_type, 
    qa.supplier_id, 
    p.email as performers_email 
FROM quote_activities qa
LEFT JOIN profiles p ON qa.performed_by = p.id;
