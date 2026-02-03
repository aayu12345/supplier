-- Add Supplier Profile Fields to 'profiles' table

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS gstin text,
ADD COLUMN IF NOT EXISTS contact_person text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS bank_details jsonb DEFAULT '{
  "bank_name": "",
  "account_number": "",
  "ifsc_code": "",
  "upi_id": ""
}'::jsonb,
ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '{
  "iso_certificate": {"status": "Pending", "url": ""},
  "msme_certificate": {"status": "Pending", "url": ""},
  "capabilities": {"status": "Pending", "url": ""}
}'::jsonb;

-- Ensure RLS allows users to update their own profile
-- (Existing policies usually allow this, but good to double check or re-apply if needed)
-- Assuming 'Users can update own profile' exists.

-- Add a comment to columns
COMMENT ON COLUMN public.profiles.bank_details IS 'Stores Bank Name, Account No, IFSC, UPI';
COMMENT ON COLUMN public.profiles.documents IS 'Stores URL and Status for various docs';
