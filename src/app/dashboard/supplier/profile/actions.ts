"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateSupplierProfile(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const company_name = formData.get("company_name") as string;
    const gstin = formData.get("gstin") as string;
    const contact_person = formData.get("contact_person") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const email = formData.get("email") as string; // Read-only usually, but illustrative

    // Bank Details
    const bank_details = {
        bank_name: formData.get("bank_name"),
        account_number: formData.get("account_number"),
        ifsc_code: formData.get("ifsc_code"),
        upi_id: formData.get("upi_id"),
    };

    // Update Profile
    const { error } = await supabase
        .from("profiles")
        .update({
            company_name,
            gstin,
            contact_person,
            phone,
            address,
            bank_details,
            // Email is separate in Auth, usually not updated here directly without auth flow
        })
        .eq("id", user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/dashboard/supplier/profile");
    return { success: "Profile updated successfully!" };
}
