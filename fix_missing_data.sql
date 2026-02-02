-- 1. Restore Visibility for Buyers (RFQs)
-- This ensures that any user can see the RFQs they created.
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can view own rfqs" 
    ON public.rfqs 
    FOR SELECT 
    USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Restore Visibility for Profiles
-- This ensures users can read their own profile data (needed for role checks too).
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Users can view own profile" 
    ON public.profiles 
    FOR SELECT 
    USING (auth.uid() = id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Restore Visibility for Timeline
ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
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
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Revert 'deeplearningpro123@gmail.com' to Buyer (Optional Helper)
-- If this user was manually set to 'admin', this sets them back to 'buyer'.
-- You must update 'YOUR_USER_ID_HERE' with the actual UUID if you want to run this specific line.
-- UPDATE public.profiles SET role = 'buyer' WHERE id = 'YOUR_USER_ID_HERE';
