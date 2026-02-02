-- 1. Create a Helper Function to Check Admin Status
-- "SECURITY DEFINER" means this function runs with the privileges of the creator (superuser/admin),
-- bypassing RLS on the table it queries. This breaks the infinite loop.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix Profiles Policy (The Source of Recursion)
-- Drop the bad policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create valid policies
-- A. Users can see their own profile (No recursion, direct ID check)
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- B. Admins can see all profiles (Uses the safe function)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin());


-- 3. Fix RFQs Policy (To be safe)
DROP POLICY IF EXISTS "Admins can view all rfqs" ON public.rfqs;
DROP POLICY IF EXISTS "Users can view own rfqs" ON public.rfqs;

-- A. Users can see own RFQs
CREATE POLICY "Users can view own rfqs" 
ON public.rfqs 
FOR SELECT 
USING (auth.uid() = user_id);

-- B. Admins can see all RFQs
CREATE POLICY "Admins can view all rfqs" 
ON public.rfqs 
FOR SELECT 
USING (is_admin());


-- 4. Fix Timeline Policy (To be safe)
DROP POLICY IF EXISTS "Users can view own timeline" ON public.order_timeline;

CREATE POLICY "Users can view own timeline" 
ON public.order_timeline 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM rfqs
    WHERE rfqs.id = order_timeline.rfq_id
    AND rfqs.user_id = auth.uid()
  )
);

-- B. Admins can see all Timeline
CREATE POLICY "Admins can view all timeline" 
ON public.order_timeline 
FOR SELECT 
USING (is_admin());
