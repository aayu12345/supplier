"use server";

// Server Actions for Auth

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/buyer");
    redirect("/dashboard/buyer");
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const role = formData.get("role") as string;

    // Use Admin Client to create verified user directly
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabaseAdmin = createAdminClient();

    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Force verification
        user_metadata: {
            name,
            phone,
            role,
        },
    });

    if (error) {
        return { error: error.message };
    }

    // Now sign them in (Admin create doesn't set session cookies)
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (signInError) {
        return { error: "Account created but failed to sign in automatically." };
    }

    revalidatePath("/dashboard/buyer");
    redirect("/dashboard/buyer");
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/dashboard/buyer");
    redirect("/dashboard/buyer");
}
