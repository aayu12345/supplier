"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "You must be logged in to update your profile." };
    }

    const updates = {
        name: formData.get("name"),
        designation: formData.get("designation"),
        phone: formData.get("phone"),
        alternate_contact: formData.get("alternate_contact"),

        company_name: formData.get("company_name"),
        business_type: formData.get("business_type"),
        website: formData.get("website"),
        gst_number: formData.get("gst_number"),
        iec_code: formData.get("iec_code"),
        pan_number: formData.get("pan_number"),
        country: formData.get("country"),
        currency: formData.get("currency"),

        registered_address: formData.get("registered_address"),
        city: formData.get("city"),
        state: formData.get("state"),
        postal_code: formData.get("postal_code"),
        dispatch_address: formData.get("dispatch_address"),

        updated_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

    if (error) {
        console.error("Profile Update Error:", error);
        return { error: "Failed to update profile." };
    }

    revalidatePath("/dashboard/buyer/settings");
    return { success: "Profile updated successfully!" };
}
