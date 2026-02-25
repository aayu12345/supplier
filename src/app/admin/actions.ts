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
        const drawingFiles = formData.getAll("drawing") as File[];
        const rfqType = formData.get("rfqType") as string || 'single';
        const mode = formData.get("mode") as string || 'draft'; // 'draft' or 'live'

        // Specifications Section
        const productionQty = formData.get("productionQty") as string; // Quantity
        const drawingNumber = formData.get("drawingNumber") as string; // Drawing Number
        const materialSize = formData.get("materialSize") as string;
        const mietWeight = formData.get("mietWeight") as string;
        const sampleQty = formData.get("sampleQty") as string;
        const sampleLeadTime = formData.get("sampleLeadTime") as string;
        const totalProcess = formData.get("totalProcess") as string;
        const material = formData.get("material") as string;
        const surfaceFinishing = formData.get("surfaceFinishing") as string;
        const hardness = formData.get("hardness") as string;

        // Pricing & Lead Time
        const targetPrice = formData.get("targetPrice") as string;
        const leadTime = formData.get("leadTime") as string;
        const quoteExpiryDate = formData.get("quoteExpiryDate") as string; // NEW

        // Production Details
        const productionRemarks = formData.get("productionRemarks") as string;
        const jobWarnings = formData.get("jobWarnings") as string;

        // Future Demand
        const futureWeek = formData.get("futureWeek") as string;
        const demandFreqValues = formData.getAll("demandFreq") as string[];
        const demandFrequency = demandFreqValues.length > 0 ? demandFreqValues : null;

        // Validate file size (25MB max per file)
        for (const f of drawingFiles) {
            if (f.size > 25 * 1024 * 1024) {
                return { error: `File ${f.name} size exceeds 25MB limit` };
            }
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

        // 2. Handle File Upload (Start with existing if provided)
        let fileUrl = formData.get("existingFileUrl") as string | null;
        let fileName = formData.get("existingFileName") as string | null;
        let attachments: { name: string; url: string }[] = [];

        const existingAttachmentsStr = formData.get("existingAttachments") as string | null;
        if (existingAttachmentsStr) {
            try {
                attachments = JSON.parse(existingAttachmentsStr);
            } catch (e) {
                console.error("Failed to parse existing attachments", e);
            }
        }

        if (drawingFiles && drawingFiles.length > 0 && drawingFiles[0].size > 0) {
            try {
                const uploadPromises = drawingFiles.map(async (file) => {
                    const fileExt = file.name.split('.').pop();
                    const genFileName = `${subRfqNumber}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                    const filePath = `rfq-drawings/${genFileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from("rfq-drawings")
                        .upload(filePath, file);

                    if (uploadError) {
                        throw new Error(`File upload failed: ${uploadError.message}`);
                    }

                    const { data: { publicUrl } } = supabase.storage.from("rfq-drawings").getPublicUrl(filePath);
                    return { name: file.name, url: publicUrl, generatedName: genFileName };
                });

                const uploadedFiles = await Promise.all(uploadPromises);
                attachments = uploadedFiles.map(f => ({ name: f.name, url: f.url }));
                fileUrl = uploadedFiles.length > 0 ? uploadedFiles[0].url : null;
                fileName = uploadedFiles.length > 0 ? uploadedFiles[0].generatedName : null;
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
                admin_status: mode === 'live' ? 'Live' : 'Draft', // Set to Live if mode is live, otherwise Draft

                // Basic Info
                part_name: partName,
                drawing_number: drawingNumber,
                quantity: productionQty,
                type: rfqType,
                admin_notes: notes || null,

                // Form Fields
                lead_time_admin: leadTime || null,
                quote_expiry_date: quoteExpiryDate ? new Date(quoteExpiryDate).toISOString() : null, // NEW

                // File
                file_url: fileUrl,
                file_name: fileName,
                attachments: attachments, // New attachments field

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

        // Log Activity: RFQ Assigned
        try {
            const { logActivity } = await import("@/lib/actions/timeline");
            await logActivity(
                userId,
                'RFQ_ASSIGNED',
                `New RFQ Assigned: ${subRfqNumber} (Part: ${partName})`,
                { rfq_id: newRfq.id, parent_rfq_id: parentId },
                newRfq.id
            );
        } catch (logErr) {
            console.error("Failed to log activity:", logErr);
        }

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
            newStatus = 'Live';  // Keep as 'Live', not 'Live Running' - that's only for official orders
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

// Move Approved Order to Official Running Orders
export async function moveToOfficialOrders(rfqId: string) {
    try {
        const supabase = await createClient();

        // 1. Fetch RFQ details to get buyer_id, quote_price, and rfq_number
        const { data: rfq, error: rfqError } = await supabase
            .from("rfqs")
            .select("id, rfq_number, user_id, quote_price, quote_lead_time, admin_status")
            .eq("id", rfqId)
            .single();

        if (rfqError || !rfq) {
            console.error("Error fetching RFQ:", rfqError);
            return { error: "RFQ not found." };
        }

        // 2. Find the accepted supplier quote (the one that was sent to buyer)
        // We need to find which supplier's quote was accepted
        // The quote_price in rfq table should match the supplier's quote
        const { data: supplierQuote, error: quoteError } = await supabase
            .from("supplier_quotes")
            .select("supplier_id, price, lead_time")
            .eq("rfq_id", rfqId)
            .eq("price", rfq.quote_price)
            .single();

        if (quoteError || !supplierQuote) {
            console.error("Error finding supplier quote:", quoteError);
            return { error: "Could not find accepted supplier quote." };
        }

        // 3. Generate order number
        const { count, error: countError } = await supabase
            .from("orders")
            .select("*", { count: 'exact', head: true });

        if (countError) {
            console.error("Error counting orders:", countError);
            return { error: "Failed to generate order number." };
        }

        const orderNumber = `ORD-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, '0')}`;

        // 4. Create order entry
        const { error: orderError } = await supabase
            .from("orders")
            .insert({
                order_number: orderNumber,
                rfq_id: rfqId,
                buyer_id: rfq.user_id,
                supplier_id: supplierQuote.supplier_id,
                status: "In Progress",
                currency: "INR",
                total_value: rfq.quote_price || 0,
                created_at: new Date().toISOString()
            });

        if (orderError) {
            console.error("Error creating order:", orderError);
            return { error: "Failed to create order entry." };
        }

        // 5. Update RFQ admin_status to 'Live Running' (correct ENUM value)
        const { error: updateError } = await supabase
            .from("rfqs")
            .update({
                admin_status: "Live Running",  // Changed from "Running" to match ENUM
                updated_at: new Date().toISOString()
            })
            .eq("id", rfqId);

        if (updateError) {
            console.error("Error updating RFQ status:", updateError);
            return { error: "Failed to update RFQ status." };
        }

        // 6. Update supplier quote status to 'Approved' so it appears in supplier's My RFQs → Approved tab
        const { error: quoteUpdateError } = await supabase
            .from("supplier_quotes")
            .update({
                status: "Approved"
            })
            .eq("rfq_id", rfqId)
            .eq("supplier_id", supplierQuote.supplier_id);

        if (quoteUpdateError) {
            console.error("Error updating supplier quote status:", quoteUpdateError);
            // Don't return error, this is not critical
        }

        console.log(`[ORDER] Created order ${orderNumber} for RFQ ${rfq.rfq_number}`);

        // 6. Revalidate all relevant paths
        revalidatePath("/admin/buyers/rfqs");
        revalidatePath("/admin/buyers/orders");
        revalidatePath("/dashboard/supplier/my-rfqs");
        revalidatePath("/dashboard/supplier/orders");

        return { success: "Order moved to official running orders successfully!" };

    } catch (error) {
        console.error("Move to Official Orders Error:", error);
        return { error: "Failed to move order. Please try again." };
    }
}
