-- Allow Authenticated Users (Suppliers) to view "Live" RFQs
-- Currently, they can only view RFQs they created (buyer logic).

DROP POLICY IF EXISTS "Authenticated users view Live RFQs" ON public.rfqs;

CREATE POLICY "Authenticated users view Live RFQs"
ON public.rfqs
FOR SELECT
USING (
  admin_status = 'Live'
  OR 
  auth.uid() = user_id -- Keep existing owner access
);

-- Note: This extends the visibility.
-- If RLS is enabled, existing policies might conflict if not careful, 
-- but OR conditions in separate policies usually work as "cumulative" access in Postgres,
-- OR we can just add this new one. 
-- Supabase combines policies with OR. 
-- So "Users can view own RFQs" (Policy A) OR "View Live" (Policy B) = Access if either true.
