-- Complete RLS Fix for Supplier Portal
-- This ensures suppliers can view live RFQs and submit/view their quotes

-- ============================================
-- PART 1: Fix supplier_quotes table policies
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage quotes" ON public.supplier_quotes;
DROP POLICY IF EXISTS "Suppliers can view own quotes" ON public.supplier_quotes;
DROP POLICY IF EXISTS "Suppliers can insert own quotes" ON public.supplier_quotes;
DROP POLICY IF EXISTS "Admins can manage all quotes" ON public.supplier_quotes;

-- 1. Allow suppliers to INSERT their own quotes
CREATE POLICY "Suppliers can insert own quotes" 
ON public.supplier_quotes
FOR INSERT 
WITH CHECK (supplier_id = auth.uid());

-- 2. Allow suppliers to SELECT their own quotes
CREATE POLICY "Suppliers can view own quotes" 
ON public.supplier_quotes
FOR SELECT 
USING (supplier_id = auth.uid());

-- 3. Allow admins to do everything
CREATE POLICY "Admins can manage all quotes" 
ON public.supplier_quotes
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND 'admin' = ANY(profiles.role)
    )
);

-- ============================================
-- PART 2: Fix rfqs table policies for suppliers
-- ============================================

-- Drop existing supplier policies
DROP POLICY IF EXISTS "Suppliers can view live RFQs" ON public.rfqs;
DROP POLICY IF EXISTS "Suppliers can update RFQ status when quoting" ON public.rfqs;

-- 1. Allow suppliers to VIEW live RFQs (for marketplace)
CREATE POLICY "Suppliers can view live RFQs" 
ON public.rfqs
FOR SELECT
USING (
    admin_status IN ('Live', 'Live Running', 'Quoted')
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND 'supplier' = ANY(profiles.role)
    )
);

-- 2. Allow suppliers to UPDATE admin_status when submitting quotes
CREATE POLICY "Suppliers can update RFQ status when quoting" 
ON public.rfqs
FOR UPDATE
USING (admin_status IN ('Live', 'Live Running'))
WITH CHECK (admin_status = 'Quoted');

-- ============================================
-- PART 3: Verify policies
-- ============================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('supplier_quotes', 'rfqs')
  AND policyname LIKE '%Supplier%'
ORDER BY tablename, policyname;
