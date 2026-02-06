# Testing Guide: Supplier Management System

## Step 1: Verify Database Setup

### Check Tables Created
Run this query in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('supplier_status', 'supplier_admin_notes', 'supplier_documents', 'supplier_quotes', 'supplier_metrics');
```

**Expected Result:** All 5 tables should be listed.

### Check Profiles Columns
```sql
-- Check if new columns were added to profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('company_name', 'gst_number', 'msme_number', 'address', 'capabilities');
```

**Expected Result:** All 5 columns should be listed.

### Check Supplier Status Initialized
```sql
-- Check if existing suppliers have status
SELECT 
    p.name,
    p.email,
    ss.status
FROM profiles p
LEFT JOIN supplier_status ss ON p.id = ss.supplier_id
WHERE 'supplier' = ANY(p.role);
```

**Expected Result:** All suppliers should have 'Active' status.

---

## Step 2: Test Supplier List Page

### Navigate to Supplier List
1. Login as **Admin**
2. Go to Admin Dashboard: `http://localhost:3000/admin/dashboard`
3. Click on **"Supplier Panel"** card
4. You should be redirected to: `http://localhost:3000/admin/suppliers`

### Test Features

#### ✅ Search Bar
- Type a supplier name/email/phone
- Table should filter results

#### ✅ City Filter
- Select a city from dropdown
- Only suppliers from that city should show

#### ✅ Status Filter
- Select "Active", "Inactive", or "Blacklisted"
- Only suppliers with that status should show

#### ✅ Sorting
- Click "Trust Score" button
- Suppliers should sort by trust score
- Click again to reverse order (↑↓)
- Try "Last Quote" and "Activity" buttons too

#### ✅ Status Change
- Find any supplier in the table
- Click the status dropdown (shows current status)
- Change to "Inactive" or "Blacklisted"
- Page should update without refresh
- Check database to confirm:
```sql
SELECT * FROM supplier_status WHERE supplier_id = 'SUPPLIER_ID_HERE';
```

---

## Step 3: Test Supplier Detail Page

### Navigate to Detail Page
1. From supplier list, click **"View Details"** on any supplier
2. You should see: `http://localhost:3000/admin/suppliers/[supplier-id]`

### Test All 6 Tabs

#### Tab 1: Company Info ✅
**Should Display:**
- Company Name
- GST Number
- MSME Number
- City
- Address
- Registered Since date

**Test:**
- All fields should show data or "N/A"
- Trust score badge should be visible in header

#### Tab 2: Documents ✅
**Should Display:**
- List of uploaded documents (GST Certificate, MSME Certificate, etc.)
- Each document with download button
- Upload date

**Test:**
- If no documents: Shows "No documents uploaded yet"
- Click download icon to download document

**Add Test Document:**
```sql
-- Insert a test document
INSERT INTO supplier_documents (supplier_id, document_type, document_url, document_name)
VALUES (
    'SUPPLIER_ID_HERE',
    'GST Certificate',
    'https://example.com/test.pdf',
    'GST_Certificate.pdf'
);
```

#### Tab 3: Quoting History ✅
**Should Display:**
- Table with: RFQ Number, Quoted Price, Status, Date
- Status badges (Pending/Accepted/Rejected)

**Test:**
- If no quotes: Shows "No quotes submitted yet"
- Prices should be formatted with ₹ symbol
- Dates should be readable

#### Tab 4: Admin Notes ✅
**Should Display:**
- Text area for internal notes
- Save button

**Test:**
1. Type some notes: "This is a test note"
2. Click "Save Notes"
3. Should show "Notes saved successfully!"
4. Refresh page - notes should persist
5. Check database:
```sql
SELECT * FROM supplier_admin_notes WHERE supplier_id = 'SUPPLIER_ID_HERE';
```

#### Tab 5: Trust Score ✅
**Should Display:**
- Large trust score number
- Breakdown metrics (On-Time Delivery, Quality Rating, Response Time)

**Test:**
- Score should match the header badge
- Color should be green (≥80), yellow (≥50), or red (<50)

#### Tab 6: Capabilities ✅
**Should Display:**
- Grid of capability badges
- Each with checkmark icon

**Test:**
- If no capabilities: Shows "No capabilities listed"

**Add Test Capabilities:**
```sql
-- Add capabilities to a supplier
UPDATE profiles 
SET capabilities = ARRAY['CNC Machining', 'Sheet Metal', '3D Printing']
WHERE id = 'SUPPLIER_ID_HERE';
```

---

## Step 4: Test Navigation

### ✅ Back Button
- Click "← Back to Suppliers" on detail page
- Should return to supplier list

### ✅ Tab Switching
- Click each tab
- URL should NOT change
- Content should switch smoothly
- No page reload

---

## Step 5: Test Permissions (Security)

### Test as Non-Admin
1. Logout from admin
2. Login as **Buyer** or **Supplier**
3. Try to access: `http://localhost:3000/admin/suppliers`

**Expected:** Should be redirected or show "Access Denied"

### Test RLS Policies
```sql
-- Try to view supplier_admin_notes as non-admin (should fail)
-- Login as supplier in Supabase and run:
SELECT * FROM supplier_admin_notes;
-- Should return 0 rows or permission denied
```

---

## Quick Verification Checklist

- [ ] Supplier list page loads
- [ ] Search works
- [ ] Filters work (City, Status)
- [ ] Sorting works (Trust Score, Last Quote, Activity)
- [ ] Status dropdown changes supplier status
- [ ] "View Details" opens detail page
- [ ] All 6 tabs are visible
- [ ] Company Info shows data
- [ ] Documents tab works (or shows empty state)
- [ ] Quoting History shows quotes (or empty state)
- [ ] Admin Notes can be saved and loaded
- [ ] Trust Score displays correctly
- [ ] Capabilities show (or empty state)
- [ ] Back button works
- [ ] Non-admins cannot access pages

---

## Common Issues & Fixes

### Issue: "No suppliers found"
**Fix:** Make sure you have users with 'supplier' role in profiles table
```sql
-- Check suppliers exist
SELECT * FROM profiles WHERE 'supplier' = ANY(role);
```

### Issue: Status dropdown doesn't work
**Fix:** Check browser console for errors. Verify `supplier_status` table exists and has data.

### Issue: Trust score shows 0
**Fix:** Check `supplier_metrics` table has data for the supplier
```sql
SELECT * FROM supplier_metrics WHERE id = 'SUPPLIER_ID_HERE';
```

### Issue: Documents not showing
**Fix:** Check `supplier_documents` table
```sql
SELECT * FROM supplier_documents WHERE supplier_id = 'SUPPLIER_ID_HERE';
```

---

## Success Criteria

✅ **All features working**
✅ **No console errors**
✅ **Data persists after refresh**
✅ **Permissions working (non-admins blocked)**
✅ **UI looks good (gradients, colors, spacing)**

---

## Next Steps After Testing

If everything works:
1. Test with real supplier data
2. Upload actual GST/MSME documents
3. Add real admin notes
4. Monitor performance with many suppliers

If issues found:
1. Check browser console for errors
2. Check Supabase logs
3. Verify SQL migrations ran successfully
4. Check RLS policies are active
