-- 1. Drop the OLD policy name if it exists
drop policy if exists "Authenticated Users can Upload Drawings" on storage.objects;

-- 2. Drop the NEW policy name if it already exists (This fixes the error you saw!)
drop policy if exists "All Users can Upload Drawings" on storage.objects;

-- 3. Create the policy fresh
create policy "All Users can Upload Drawings"
  on storage.objects for insert
  with check ( bucket_id = 'rfq-drawings' );
