-- Fix RLS Policies for Supplier Quote Submission
-- This adds missing policies that allow suppliers to submit quotes

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage quotes" ON public.supplier_quotes;
DROP POLICY IF EXISTS "Suppliers can view own quotes" ON public.supplier_quotes;
DROP POLICY IF EXISTS "Suppliers can insert own quotes" ON public.supplier_quotes;

-- Recreate policies with correct permissions

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

-- 3. Allow admins to do everything (SELECT, INSERT, UPDATE, DELETE)
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

-- 4. Fix RFQ table policies to allow suppliers to update admin_status when quoting
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Suppliers can update RFQ status when quoting" ON public.rfqs;

-- Allow suppliers to update admin_status to 'Quoted' for Live RFQs
CREATE POLICY "Suppliers can update RFQ status when quoting" 
ON public.rfqs
FOR UPDATE
USING (admin_status = 'Live')
WITH CHECK (admin_status = 'Quoted');

-- Verify policies
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
ORDER BY tablename, policyname;
