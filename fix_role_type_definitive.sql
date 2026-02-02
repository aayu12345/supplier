-- DEFINITIVE FIX FOR PROFILES AND BUYERS LIST ERROR
-- This script fixes "malformed array literal", missing columns, and RLS recursion.

-- 1. DROP EXISTING POLICIES (To avoid dependencies on 'role' column while we fix it)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

-- 2. NORMALIZE 'role' COLUMN TO SIMPLE TEXT
-- We rename the old column to back it up, create a fresh text column, and migrate data.
DO $$ 
BEGIN
    -- Check if 'role' exists and rename it
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles RENAME COLUMN role TO role_old;
    END IF;
END $$;

-- Create the clean text column
ALTER TABLE public.profiles 
ADD COLUMN role text DEFAULT 'buyer';

-- Migrate data from backup (handling arrays, enums, or text)
UPDATE public.profiles 
SET role = 
  CASE 
    -- If old role is NULL, default to buyer
    WHEN role_old IS NULL THEN 'buyer'
    
    -- If it was an array string like "{admin}", extract "admin"
    -- This fixes the "malformed array literal" issue
    WHEN role_old::text LIKE '{%}' THEN trim(both '{}' from role_old::text)
    
    -- Otherwise cast to text
    ELSE role_old::text 
  END;

-- Clean up (Optional: You can keep role_old for safety, or drop it)
-- ALTER TABLE public.profiles DROP COLUMN role_old;


-- 3. ENSURE OTHER COLUMNS EXIST
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS name text;


-- 4. RE-ESTABLISH RLS POLICIES (Safe Versions)

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy A: View - Authenticated users can see basic profile info
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
USING ( auth.role() = 'authenticated' );

-- Policy B: Update - Users can update ONLY their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING ( auth.uid() = id );

-- Policy C: Insert - Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK ( auth.uid() = id );
