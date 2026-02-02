-- ==========================================
-- FINAL FIX FOR DATA VISIBILITY & RECURSION
-- ==========================================

-- 1. Create a Secure Helper Function (Breaks Infinite Loop)
-- This function checks if you are an admin WITHOUT triggering RLS loops.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Reset Policies for PROFILES
-- Drop potentially bad policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create correct policies
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (is_admin());

-- 3. Reset Policies for RFQS
DROP POLICY IF EXISTS "Admins can view all rfqs" ON public.rfqs;
DROP POLICY IF EXISTS "Users can view own rfqs" ON public.rfqs;

-- Create correct policies
CREATE POLICY "Users can view own rfqs" 
ON public.rfqs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all rfqs" 
ON public.rfqs FOR SELECT 
USING (is_admin());

-- 4. Reset Policies for TIMELINE
DROP POLICY IF EXISTS "Users can view own timeline" ON public.order_timeline;
DROP POLICY IF EXISTS "Admins can view all timeline" ON public.order_timeline;

CREATE POLICY "Users can view own timeline" 
ON public.order_timeline FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM rfqs
    WHERE rfqs.id = order_timeline.rfq_id
    AND rfqs.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all timeline" 
ON public.order_timeline FOR SELECT 
USING (is_admin());

-- 5. Ensure RLS is ENABLED
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;

-- 6. Verification (Optional)
-- You can run: SELECT * FROM rfqs; matches should appear now.
