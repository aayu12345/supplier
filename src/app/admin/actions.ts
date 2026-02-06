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

// Updated createSubRFQ to handle FormData and File Uploads
export async function createSubRFQ(formData: FormData) {
    try {
        const supabase = await createClient();

        // Validate required fields
        const parentId = formData.get("parentId") as string;
        const parentRfqNumber = formData.get("parentRfqNumber") as string;
        const userId = formData.get("userId") as string;
        const partName = formData.get("partName") as string;

        if (!parentId || !parentRfqNumber || !userId || !partName) {
            return { error: "Missing required fields (Parent ID, RFQ Number, User ID, Part Name)" };
        }

        // Basic Form Fields
        const notes = formData.get("notes") as string;
        const drawingFile = formData.get("drawing") as File | null;
        const rfqType = formData.get("rfqType") as string || 'single';

        // Specifications Section
        const materialSize = formData.get("materialSize") as string;
        const mietWeight = formData.get("mietWeight") as string;
        const sampleQty = formData.get("sampleQty") as string;
        const sampleLeadTime = formData.get("sampleLeadTime") as string;
        const totalProcess = formData.get("totalProcess") as string;
        const material = formData.get("material") as string;
        const surfaceFinishing = formData.get("surfaceFinishing") as string;
        const hardness = formData.get("hardness") as string;

        // Pricing
        const targetPrice = formData.get("targetPrice") as string;

        // Production Details
        const productionRemarks = formData.get("productionRemarks") as string;
        const jobWarnings = formData.get("jobWarnings") as string;

        // Future Demand
        const futureWeek = formData.get("futureWeek") as string;
        const demandFreqValues = formData.getAll("demandFreq") as string[];
        const demandFrequency = demandFreqValues.length > 0 ? demandFreqValues : null;

        // Validate file size (25MB max)
        if (drawingFile && drawingFile.size > 25 * 1024 * 1024) {
            return { error: "File size exceeds 25MB limit" };
        }

        // 1. Generate Sub-RFQ Number
        const { count, error: countError } = await supabase
            .from("rfqs")
            .select("*", { count: 'exact', head: true })
            .eq("parent_rfq_id", parentId);

        if (countError) {
            console.error("Count error:", countError);
            return { error: "Failed to generate RFQ number" };
        }

        const suffix = (count || 0) + 1;
        const subRfqNumber = `${parentRfqNumber}-${String(suffix).padStart(2, '0')}`;

        // 2. Handle File Upload (if present)
        let fileUrl = null;
        let fileName = null;

        if (drawingFile && drawingFile.size > 0) {
            try {
                const fileExt = drawingFile.name.split('.').pop();
                fileName = drawingFile.name;
                const filePath = `rfq-drawings/${subRfqNumber}-${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from("rfq-drawings")
                    .upload(filePath, drawingFile);

                if (uploadError) {
                    console.error("Upload error:", uploadError);
                    return { error: `File upload failed: ${uploadError.message}` };
                }

                const { data: { publicUrl } } = supabase.storage.from("rfq-drawings").getPublicUrl(filePath);
                fileUrl = publicUrl;
            } catch (uploadErr: any) {
                console.error("File upload exception:", uploadErr);
                return { error: "File upload failed. Please try again." };
            }
        }

        // 3. Create Sub-RFQ with all detailed fields
        const { data: newRfq, error: insertError } = await supabase
            .from("rfqs")
            .insert({
                parent_rfq_id: parentId,
                rfq_number: subRfqNumber,
                user_id: userId,
                status: 'Draft',
                admin_status: 'Draft',

                // Basic Info
                part_name: partName,
                type: rfqType,
                admin_notes: notes || null,

                // File
                file_url: fileUrl,
                file_name: fileName,

                // Specifications
                material_size: materialSize || null,
                miet_weight: mietWeight ? parseFloat(mietWeight) : null,
                sample_quantity: sampleQty ? parseInt(sampleQty) : null,
                sample_lead_time: sampleLeadTime || null,
                total_process: totalProcess || null,
                material_admin: material || null,
                finish: surfaceFinishing || null,
                hardness: hardness || null,

                // Pricing
                target_price: targetPrice ? parseFloat(targetPrice) : null,

                // Production
                production_remarks: productionRemarks || null,
                job_warnings: jobWarnings || null,

                // Future Demand
                future_demand_date: futureWeek ? new Date(futureWeek).toISOString() : null,
                future_demand_frequency: demandFrequency,

                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (insertError) {
            console.error("Insert error:", insertError);
            return { error: `Failed to create Sub-RFQ: ${insertError.message}` };
        }

        // 4. Update Parent Status
        const { error: updateError } = await supabase
            .from("rfqs")
            .update({ admin_status: 'Drafts Created' })
            .eq("id", parentId)
            .eq("admin_status", "New");

        if (updateError) {
            console.error("Parent update error:", updateError);
            // Don't fail the whole operation if parent update fails
        }

        revalidatePath(`/admin/buyers/rfqs/${parentId}`);
        return { success: true, newId: newRfq.id };

    } catch (error: any) {
        console.error("Create Sub-RFQ Error:", error);
        return { error: error?.message || "An unexpected error occurred" };
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
