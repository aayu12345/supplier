-- Fix handle_new_user trigger to support text[] role column
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_str text;
    user_role_arr text[];
BEGIN
    -- Extract role from metadata (it comes as a string usually 'supplier' or 'buyer')
    user_role_str := new.raw_user_meta_data->>'role';

    -- Default to buyer if missing
    IF user_role_str IS NULL THEN
        user_role_arr := ARRAY['buyer'];
    ELSE
        -- Convert single string to array
        user_role_arr := ARRAY[user_role_str];
    END IF;

    -- Insert into profiles
    -- Note: We map 'name' from metadata to the 'name' column in profiles
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        new.id, 
        new.email, 
        new.raw_user_meta_data->>'name', -- Assuming 'name' key in metadata
        user_role_arr
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
