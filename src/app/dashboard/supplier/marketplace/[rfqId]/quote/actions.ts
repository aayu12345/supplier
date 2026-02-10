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

    // Get Supplier Profile for Name
    const { data: profile } = await supabase
        .from("profiles")
        .select("contact_person, company_name, name, email")
        .eq("id", user.id)
        .single();

    // Construct Display Name
    let supplierName = "Unknown Supplier";

    if (profile) {
        const contact = profile.contact_person?.trim();
        const company = profile.company_name?.trim();
        const name = profile.name?.trim();

        if (contact && company) {
            supplierName = `${contact} (${company})`;
        } else if (company) {
            supplierName = company;
        } else if (contact) {
            supplierName = contact;
        } else if (name) {
            supplierName = name;
        } else {
            supplierName = profile.email || "Unknown Supplier";
        }
    }

    // Insert quote using correct schema column names
    const { data, error } = await supabase
        .from("supplier_quotes")
        .insert({
            rfq_id: rfqId,
            supplier_id: user.id,
            supplier_name: supplierName,
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

    // Update RFQ Status to 'Quoted' if it is 'Live'
    // This ensures it moves to the 'Quoted' tab in Admin Dashboard
    const { error: updateError } = await supabase
        .from('rfqs')
        .update({ admin_status: 'Quoted' })
        .eq('id', rfqId)
        .eq('admin_status', 'Live');

    if (updateError) {
        console.error("Error updating RFQ status:", updateError);
        // We don't block the user, just log it
    }


    // Log Activity
    const { logActivity } = await import("@/lib/actions/timeline");
    await logActivity(
        user.id,
        "QUOTE_SUBMITTED",
        `Quote Submitted`,
        { quote_id: data.id, amount: unitPrice, rfq_id: rfqId },
        rfqId
    );

    revalidatePath("/dashboard/supplier/my-rfqs");
    redirect(`/dashboard/supplier/marketplace/${rfqId}/quote/success`);
}
