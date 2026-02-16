-- Enable Realtime for rfq_negotiations table
-- This is REQUIRED for the chat to update without refreshing
-- Use this command to add the table to the supabase_realtime publication

-- 1. Check if the table is already in the publication (optional)
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'rfq_negotiations';

-- 2. Add the table to the publication
-- This command enables Supabase Realtime for this specific table
ALTER PUBLICATION supabase_realtime ADD TABLE rfq_negotiations;

-- 3. Verify RLS (Row Level Security) is enabled (it should be, but good to check)
ALTER TABLE rfq_negotiations ENABLE ROW LEVEL SECURITY;

-- Note: If you get an error saying the table is already in the publication, that's fine.
-- Run this in the Supabase SQL Editor.
