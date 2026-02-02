-- 1. Create Role Enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'buyer', 'supplier');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add Role Column to Profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'buyer';

-- 3. Update Policies for Admin Access
-- Allow Admins to View ALL Profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Allow Admins to View ALL RFQs (assuming RFQs table exists)
CREATE POLICY "Admins can view all rfqs" 
ON public.rfqs
FOR SELECT 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Allow Admins to View ALL Orders (assuming orders logic uses RFQs or similar)
-- (Add similar policies for invoices, payments etc as needed)

-- 4. Helper Function to Make a User an Admin (Run manually)
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID';
