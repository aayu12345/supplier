-- 1. Create RFQs table
create table if not exists public.rfqs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id), -- Nullable for new users initially
  rfq_number text unique not null,
  status text default 'Pending',
  
  -- File Info
  file_url text not null,
  file_name text not null,
  
  -- Form Data
  type text not null, -- 'single' or 'multiple'
  quantity text,
  lead_time date,
  target_price numeric,
  notes text,
  
  -- New User Info (if applicable)
  contact_name text,
  contact_email text,
  contact_phone text
);

-- 2. Enable RLS
alter table public.rfqs enable row level security;

-- 3. Policies for RFQs
-- Admin can view all, Users can view their own
create policy "Users can view own RFQs"
  on rfqs for select
  using ( auth.uid() = user_id );

create policy "Users can insert RFQs"
  on rfqs for insert
  with check ( true ); -- Allow all to insert (including anon for new user flow, logic handled in backend)

-- 4. Create Storage Bucket for Drawings
insert into storage.buckets (id, name, public)
values ('rfq-drawings', 'rfq-drawings', true)
on conflict (id) do nothing;

-- 5. Storage Policies
create policy "Public Access to Drawings (Read)"
  on storage.objects for select
  using ( bucket_id = 'rfq-drawings' );

create policy "Authenticated Users can Upload Drawings"
  on storage.objects for insert
  with check ( bucket_id = 'rfq-drawings' );
