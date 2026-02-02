-- SUPPORT FOR MULTIPLE ROLES (Text Array) - CORRECTED
-- This allows one user to be ['admin', 'buyer', 'supplier'] simultaneously.

-- 1. DROP EXISTING POLICIES (Robust)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
-- Drop the one that caused the error (no period at end)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;


-- 2. MIGRATE 'role' COLUMN FROM TEXT TO TEXT[] (Array)
DO $$ 
BEGIN
    -- Rename old text column if it is still 'text' type
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role' AND data_type = 'text') THEN
        ALTER TABLE public.profiles RENAME COLUMN role TO role_single;
    END IF;
END $$;

-- Create new array column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text[] DEFAULT '{buyer}';

-- Migrate data: Convert single value 'admin' to array '{admin}'
-- Only if role_single exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role_single') THEN
        UPDATE public.profiles 
        SET role = ARRAY[role_single]
        WHERE role_single IS NOT NULL;
    END IF;
END $$;


-- 3. UPDATE YOUR USER TO HAVE ALL ROLES
UPDATE public.profiles
SET role = '{admin, buyer, supplier}'
WHERE email = 'deeplearningpro123@gmail.com';


-- 4. UPDATE RLS POLICIES TO HANDLE ARRAYS

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy A: View - Authenticated users can see basic profile info
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
USING ( auth.role() = 'authenticated' );

-- Policy B: Self Update
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING ( auth.uid() = id );

-- Policy C: Self Insert
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK ( auth.uid() = id );
