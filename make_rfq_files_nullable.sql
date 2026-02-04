-- Make file columns nullable in rfqs table to support Multiple Item RFQs where files are attached to items instead.

DO $$
BEGIN
    -- 1. Alter file_url to be nullable
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rfqs' AND column_name = 'file_url' AND is_nullable = 'NO') THEN
        ALTER TABLE public.rfqs ALTER COLUMN file_url DROP NOT NULL;
    END IF;

    -- 2. Alter file_name to be nullable
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rfqs' AND column_name = 'file_name' AND is_nullable = 'NO') THEN
        ALTER TABLE public.rfqs ALTER COLUMN file_name DROP NOT NULL;
    END IF;
END $$;
