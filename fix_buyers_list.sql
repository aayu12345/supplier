-- 1. Ensure Columns Exist (Idempotent)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'buyer';

-- 2. Fix Infinite Recursion in RLS
-- Drop the problematic policy if it exists
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a safe policy using JWT metadata (avoids querying the table itself)
-- This assumes you store 'role' in raw_user_meta_data or app_metadata
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.jwt() -> 'user_metadata' ->> 'role' = 'admin' 
  OR 
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
);

-- 3. Fallback: Allow authenticated users to view basic profile info (if public view is desired)
-- This matches "Public profiles are viewable by everyone" logic but ensures it's explicit
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
USING ( auth.role() = 'authenticated' );

-- 4. Enable RLS (just in case)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
