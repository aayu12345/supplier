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

export async function createSubRFQ(parentId: string, itemData: any, parentRfqNumber: string) {
    const supabase = await createClient();

    try {
        // 1. Fetch Parent Logic (Optional validation, but ID is passed)
        // 2. Generate Sub-RFQ Number by counting existing children
        const { count } = await supabase
            .from("rfqs")
            .select("*", { count: 'exact', head: true })
            .eq("parent_rfq_id", parentId);

        const suffix = (count || 0) + 1;
        const subRfqNumber = `${parentRfqNumber}-${String(suffix).padStart(2, '0')}`;

        // 3. Create Sub-RFQ
        const { data: newRfq, error } = await supabase
            .from("rfqs")
            .insert({
                parent_rfq_id: parentId,
                rfq_number: subRfqNumber,
                user_id: itemData.user_id, // Same buyer
                status: 'Draft', // Internal status (not admin_status, wait... check schema) 
                // Using admin_status for workflow based on previous file analysis
                admin_status: 'Draft',

                // Item Specifics
                file_url: itemData.file_url,
                file_name: itemData.file_name,
                drawing_number: itemData.drawing_number,
                quantity: itemData.quantity,
                target_price: itemData.target_price,
                lead_time: itemData.lead_time,

                // Inherited/Default
                type: 'single', // Sub-RFQ is logically single item
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        // 4. Update Parent Status
        await supabase
            .from("rfqs")
            .update({ admin_status: 'Drafts Created' })
            .eq("id", parentId)
            // Only update if currently New
            .eq("admin_status", "New");

        revalidatePath(`/admin/buyers/rfqs/${parentId}`);
        return { success: true, newId: newRfq.id };

    } catch (error: any) {
        console.error("Create Sub-RFQ Error:", error);
        return { error: error.message };
    }
}

export async function updateParentStatus(parentId: string) {
    const supabase = await createClient();

    try {
        // Fetch all children statuses
        const { data: children } = await supabase
            .from("rfqs")
            .select("admin_status")
            .eq("parent_rfq_id", parentId);

        if (!children || children.length === 0) return;

        let newStatus = 'Drafts Created';

        const anyLive = children.some(c => ['Live', 'Quoted', 'Sent to Buyer', 'Rejected', 'Approved'].includes(c.admin_status));
        const allClosed = children.every(c => ['Approved', 'Rejected', 'Closed'].includes(c.admin_status));

        if (allClosed && children.length > 0) {
            newStatus = 'Closed';
        } else if (anyLive) {
            newStatus = 'Live Running';
        }

        await supabase
            .from("rfqs")
            .update({ admin_status: newStatus })
            .eq("id", parentId);

        revalidatePath(`/admin/buyers/rfqs/${parentId}`);
        return { success: true };

    } catch (error) {
        console.error("Update Parent Status Error:", error);
        return { error: 'Failed to update parent status' };
    }
}
