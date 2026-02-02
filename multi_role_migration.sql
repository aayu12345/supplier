-- 1. Convert 'role' column to Array
-- We assume the default was already dropped or we are overriding it.
-- We must explicitly cast the array construction to the target type.
ALTER TABLE public.profiles 
  ALTER COLUMN role TYPE user_role[] 
  USING ARRAY[role]::user_role[];

-- Set default to array containing 'buyer'
ALTER TABLE public.profiles 
  ALTER COLUMN role SET DEFAULT ARRAY['buyer']::user_role[];

-- 2. Update is_admin() function to handle Arrays
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND 'admin' = ANY(role) -- Check if 'admin' is ANY of the roles in the array
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update Policies (No changes needed if they use is_admin(), but let's be sure)
-- The previous policies used is_admin(), so they will automatically work with the new function logic!

-- 4. Helper to Assign ALL Roles to a User (Run this for your user)
-- Replace 'YOUR_EMAIL' with the actual email to look up the ID, or use the ID directly.
-- UPDATE public.profiles 
-- SET role = ARRAY['admin', 'buyer', 'supplier']::user_role[]
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'deeplearningpro123@gmail.com');
