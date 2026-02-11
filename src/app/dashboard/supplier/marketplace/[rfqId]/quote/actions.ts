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
    // IMPORTANT: We use the admin client here to bypass RLS policies
    console.log('=== ATTEMPTING RFQ STATUS UPDATE ===');
    console.log('RFQ ID:', rfqId);

    // Import admin client that bypasses RLS
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminSupabase = createAdminClient();

    const { data: updateData, error: updateError } = await adminSupabase
        .from('rfqs')
        .update({ admin_status: 'Quoted' })
        .eq('id', rfqId)
        .eq('admin_status', 'Live')
        .select();

    console.log('Update Result:', updateData);
    console.log('Update Error:', updateError);

    if (updateError) {
        console.error("Error updating RFQ status:", updateError);
        console.error("Error details:", JSON.stringify(updateError, null, 2));
        // We don't block the user, just log it
    } else if (!updateData || updateData.length === 0) {
        console.warn("RFQ status was not updated. Possible reasons:");
        console.warn("1. RFQ is not in 'Live' status");
        console.warn("2. RFQ ID does not exist");
    } else {
        console.log("✅ RFQ status successfully updated to 'Quoted'");
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
