# Fix: Supplier Documents Not Showing in Admin Panel

## Problem
Supplier uploads documents in their profile, but admin cannot see them in the supplier detail page.

## Root Cause
The upload API was saving documents to `profiles.documents` (JSONB field) instead of the `supplier_documents` table that the admin panel reads from.

## Solution Applied

### 1. Updated Upload API
**File:** `src/app/api/upload-document/route.ts`

**Changes:**
- ✅ Now saves documents to `supplier_documents` table
- ✅ Maps document types correctly (ISO Certificate, MSME Certificate, etc.)
- ✅ Maintains backward compatibility with `profiles.documents`

### 2. Storage Bucket Required

**You need to create a Supabase Storage bucket:**

1. Go to Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. **Bucket name:** `supplier-documents`
4. **Public bucket:** ✅ Yes (check this box)
5. Click "Create bucket"

### 3. Set Bucket Permissions

After creating the bucket, set these policies:

```sql
-- Allow authenticated users to upload their own documents
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'supplier-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own documents
CREATE POLICY "Users can read own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'supplier-documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to read all documents
CREATE POLICY "Admins can read all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'supplier-documents'
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND 'admin' = ANY(profiles.role)
    )
);
```

## Testing

### Step 1: Create Storage Bucket
Follow instructions above

### Step 2: Test Upload
1. Login as **Supplier**
2. Go to Profile page
3. Upload a document (ISO, MSME, or Capabilities)
4. Should see "Document uploaded successfully!"

### Step 3: Verify in Admin Panel
1. Login as **Admin**
2. Go to Suppliers → View Details
3. Click "Documents" tab
4. **Should now see the uploaded documents!**

### Step 4: Check Database
```sql
-- Verify documents are in the table
SELECT 
    sd.document_type,
    sd.document_name,
    sd.uploaded_at,
    p.name as supplier_name
FROM supplier_documents sd
JOIN profiles p ON sd.supplier_id = p.id
ORDER BY sd.uploaded_at DESC;
```

## What Changed

### Before:
```
Supplier uploads → profiles.documents (JSONB) → Admin can't see ❌
```

### After:
```
Supplier uploads → supplier_documents table → Admin can see ✅
                 ↘ profiles.documents (backup) → Backward compatible
```

## Troubleshooting

### Issue: "Upload failed"
**Fix:** Make sure `supplier-documents` bucket exists in Supabase Storage

### Issue: "Failed to save document record"
**Fix:** Check that `supplier_documents` table exists (run `supplier_management_setup.sql`)

### Issue: Documents still not showing
**Fix:** 
1. Check browser console for errors
2. Verify RLS policies on `supplier_documents` table
3. Check that `document_type` matches the constraint

## Summary

✅ **Fixed:** Upload API now saves to `supplier_documents` table  
✅ **Required:** Create `supplier-documents` storage bucket  
✅ **Result:** Admin can now see all uploaded supplier documents  
✅ **Bonus:** Backward compatible with old system
