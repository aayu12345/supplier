-- Create Storage Bucket for Supplier Documents
-- Run this in Supabase SQL Editor

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('supplier-documents', 'supplier-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
CREATE POLICY "Suppliers can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'supplier-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Suppliers can view own documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'supplier-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'supplier-documents'
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND 'admin' = ANY(profiles.role)
    )
);
