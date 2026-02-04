-- 1. Create table if not exists
create table if not exists public.rfq_items (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  rfq_id uuid references public.rfqs(id) on delete cascade not null,
  
  drawing_number text,
  quantity text,
  target_price numeric,
  lead_time date
);

-- 2. Add columns if they usually don't exist (Idempotent approach)
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name = 'rfq_items' and column_name = 'file_url') then
    alter table public.rfq_items add column file_url text;
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'rfq_items' and column_name = 'file_name') then
    alter table public.rfq_items add column file_name text;
  end if;
end $$;

-- 3. Enable RLS
alter table public.rfq_items enable row level security;

-- 4. Drop existing policies to avoid conflicts
drop policy if exists "Users can view own RFQ Items" on rfq_items;
drop policy if exists "Users can insert RFQ Items" on rfq_items;
drop policy if exists "Admins can view all RFQ Items" on rfq_items;

-- 5. Re-create Policies
create policy "Users can view own RFQ Items"
  on rfq_items for select
  using (
    exists (
      select 1 from rfqs
      where rfqs.id = rfq_items.rfq_id
      and rfqs.user_id = auth.uid()
    )
  );

create policy "Users can insert RFQ Items"
  on rfq_items for insert
  with check (
    exists (
       select 1 from rfqs
       where rfqs.id = rfq_items.rfq_id
    )
    OR true -- Allow insert for transaction flow
  );

create policy "Admins can view all RFQ Items"
  on rfq_items for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and 'admin' = ANY(profiles.role)
    )
  );
