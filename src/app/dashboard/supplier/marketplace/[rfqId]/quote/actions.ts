"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitQuote(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const rfqId = formData.get("rfq_id") as string;
    const unitPrice = parseFloat(formData.get("unit_price") as string);
    const deliveryTime = formData.get("delivery_time") as string;
    const notes = formData.get("notes") as string;
    const termsAccepted = formData.get("terms_accepted") === "on";
    const commitmentAccepted = formData.get("commitment_accepted") === "on";

    // Validation
    if (!termsAccepted || !commitmentAccepted) {
        return { error: "Please accept both mandatory checkboxes" };
    }

    if (!unitPrice || !deliveryTime) {
        return { error: "Please fill in all required fields" };
    }

    // Get supplier name from profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

    // Insert quote using correct schema column names
    const { data, error } = await supabase
        .from("supplier_quotes")
        .insert({
            rfq_id: rfqId,
            supplier_id: user.id,
            supplier_name: profile?.full_name || "Unknown Supplier",
            price: unitPrice,
            lead_time: `${deliveryTime} days`,
            remarks: notes || null,
            status: "Pending",
        })
        .select()
        .single();

    if (error) {
        console.error("Error submitting quote:", error);
        return { error: error.message };
    }

    // TODO: Send notification to admin (implement later)

    revalidatePath("/dashboard/supplier/my-rfqs");
    redirect(`/dashboard/supplier/marketplace/${rfqId}/quote/success`);
}
