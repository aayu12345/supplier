-- RESTORE ADMIN ACCESS
-- Update the specific user to be an admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'deeplearningpro123@gmail.com';

-- Verify the change (Output should show 'admin')
SELECT email, role FROM public.profiles WHERE email = 'deeplearningpro123@gmail.com';
