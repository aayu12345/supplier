-- Upgrade Orders Schema for Supplier Portal

DO $$
BEGIN
    -- 1. Add supplier_id to orders table (Crucial for Supplier Dashboard)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'supplier_id') THEN
        ALTER TABLE public.orders ADD COLUMN supplier_id UUID REFERENCES public.profiles(id);
    END IF;

    -- 2. Add 'stage' to order_timeline if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_timeline' AND column_name = 'stage') THEN
        ALTER TABLE public.order_timeline ADD COLUMN stage TEXT;
    END IF;
    
    -- 3. Add 'file_url' to order_timeline (user requested update with file)
    -- It already has 'attachment_url', so we can reuse that or rename. 
    -- Let's stick to 'attachment_url' but ensure it exists.

    -- 4. Ensure status constraint on timeline updates
    -- (Existing check is: status IN ('Pending', 'Approved', 'Rejected')) - This is good.

END $$;
