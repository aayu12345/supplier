-- 1. Check existing constraint and DROP it if it points to auth.users (to avoid conflicts)
-- We can't easily conditionally drop constraint by name unless we know it, 
-- but we can ADD a new one if it doesn't exist.

-- However, to keep it simple and effective:
-- We want `rfqs.user_id` to reference `public.profiles.id`.

ALTER TABLE public.rfqs
DROP CONSTRAINT IF EXISTS rfqs_user_id_fkey; -- Try dropping standard named key

-- 2. Add Foreign Key to Public Profiles
-- This enables PostgREST to automatically join 'rfqs' with 'profiles' via 'user_id'.
ALTER TABLE public.rfqs
ADD CONSTRAINT rfqs_user_id_fkey_profiles
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- 3. Verify Columns (Optional - ensuring types match)
-- profiles.id is usually UUID, rfqs.user_id should be UUID.
