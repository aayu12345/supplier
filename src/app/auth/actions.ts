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

    // --- LOGIN LOGIC ---
    if (error) {
        return { error: error.message };
    }

    // Fetch user profile to check role
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const roles = Array.isArray(profile?.role) ? profile.role : [profile?.role || ""];
        const loginRole = formData.get("login_role") as string;

        // 1. If explicit role requested and user HAS that role, go there
        if (loginRole && roles.includes(loginRole)) {
            if (loginRole === 'supplier') {
                revalidatePath("/dashboard/supplier");
                redirect("/dashboard/supplier");
            } else if (loginRole === 'buyer') {
                revalidatePath("/dashboard/buyer");
                redirect("/dashboard/buyer");
            } else if (loginRole === 'admin') {
                redirect("/admin/dashboard");
            }
        }

        // 2. Fallback Priority (if no specific role requested or invalid request)
        if (roles.includes('supplier')) {
            revalidatePath("/dashboard/supplier");
            redirect("/dashboard/supplier");
        } else if (roles.includes('admin')) {
            redirect("/admin/dashboard");
        } else {
            redirect("/dashboard/buyer");
        }
    }

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
            role, // Trigger will handle this into profile
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

    // Redirect based on the REGISTERED role
    if (role === 'supplier') {
        revalidatePath("/dashboard/supplier");
        redirect("/dashboard/supplier");
    } else if (role === 'admin') {
        redirect("/admin/dashboard");
    } else {
        revalidatePath("/dashboard/buyer");
        redirect("/dashboard/buyer");
    }
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/");
    redirect("/start/supplier");
}
