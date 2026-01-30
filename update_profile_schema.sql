-- Add new columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS designation text,
ADD COLUMN IF NOT EXISTS alternate_contact text,

-- Company Info
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS business_type text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS gst_number text,
ADD COLUMN IF NOT EXISTS iec_code text,
ADD COLUMN IF NOT EXISTS pan_number text,
ADD COLUMN IF NOT EXISTS country text default 'India',
ADD COLUMN IF NOT EXISTS currency text default 'INR',
ADD COLUMN IF NOT EXISTS timezone text,

-- Address Info
ADD COLUMN IF NOT EXISTS registered_address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS dispatch_address text,

-- Preferences
ADD COLUMN IF NOT EXISTS notifications_email boolean default true,
ADD COLUMN IF NOT EXISTS notifications_whatsapp boolean default true,
ADD COLUMN IF NOT EXISTS notifications_promo boolean default false,

-- Metadata
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default timezone('utc'::text, now());

-- Initial Policy for Updating (already exists but ensuring specific columns are covered)
-- The existing policy "Users can update own profile" is sufficient.
