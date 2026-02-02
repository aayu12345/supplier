"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function loginAdmin(formData: FormData) {
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

    // Role Verification
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        // Handle both single string (legacy/transition) and array types safely
        const roles = Array.isArray(profile?.role) ? profile.role : [profile?.role];

        if (!roles.includes("admin")) {
            await supabase.auth.signOut();
            return { error: "Unauthorized: Access restricted to Administrators." };
        }
    }

    revalidatePath("/admin/dashboard", "layout");
    redirect("/admin/dashboard");
}

export async function signOutAdmin() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/admin/login");
}
