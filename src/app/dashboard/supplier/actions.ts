"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function uploadPerformaInvoice(formData: FormData) {
    const rfqId = formData.get("rfqId") as string;
    const file = formData.get("file") as File;
    // We might need to fetch the quote details to get the price/currency/buyer_id?
    // Or we rely on client passing them? Better fetch from DB for security.

    if (!file || !rfqId) return { error: "Missing file or RFQ ID" };

    const supabase = await createClient();

    try {
        // 1. Upload File
        const fileExt = file.name.split('.').pop();
        const fileName = `PI-${rfqId}-${Date.now()}.${fileExt}`;
        const filePath = `invoices/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from("rfq-drawings") // Using same bucket for now, or new 'orders' bucket? 'rfq-drawings' is fine if public/auth access is ok.
            // Ideally 'orders' bucket is better. Let's assume rfq-drawings for simplicity as previously used.
            .upload(filePath, file);

        if (uploadError) throw new Error("File upload failed: " + uploadError.message);

        const { data: { publicUrl } } = supabase.storage.from("rfq-drawings").getPublicUrl(filePath);

        // 2. Fetch RFQ & Quote Details to create Order
        // We need: buyer_id, final_price, currency from the APPROVED quote.
        const { data: rfqData, error: rfqError } = await supabase
            .from("rfqs")
            .select("*, supplier_quotes(*)") // Clean select
            .eq("id", rfqId)
            .single();

        if (rfqError || !rfqData) throw new Error("RFQ not found");

        // Cast rfqData to allow dynamic access to user_id and quote_price if types are missing
        const rfq = rfqData as any;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        // 3. Create Order Record
        const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

        const { error: orderError } = await supabase
            .from("orders")
            .insert({
                rfq_id: rfqId,
                buyer_id: rfq.user_id,
                supplier_id: user.id, // Linking to current supplier
                order_number: orderNumber,
                status: 'In Progress',
                currency: 'INR', // Default or fetch from quote
                total_value: rfq.quote_price || 0, // We stored this on RFQ in previous steps
                pi_url: publicUrl,
                created_at: new Date().toISOString()
            });

        if (orderError) throw orderError;

        // 4. Update RFQ Status to 'Order Placed' or 'Closed'?
        await supabase.from("rfqs").update({ admin_status: 'Order Placed' }).eq("id", rfqId);

        revalidatePath("/dashboard/supplier/my-rfqs");
        revalidatePath("/dashboard/supplier/orders");

        return { success: "Order Created Successfully!" };

    } catch (e: any) {
        console.error("Error creating order:", e);
        return { error: e.message };
    }
}

export async function submitOrderUpdate(formData: FormData) {
    const orderId = formData.get("orderId") as string;
    const stage = formData.get("stage") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File | null;

    const supabase = await createClient();

    try {
        let attachmentUrl = null;

        if (file && file.size > 0) {
            const fileName = `Update-${orderId}-${Date.now()}.${file.name.split('.').pop()}`;
            const filePath = `updates/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("rfq-drawings")
                .upload(filePath, file);

            if (!uploadError) {
                const { data } = supabase.storage.from("rfq-drawings").getPublicUrl(filePath);
                attachmentUrl = data.publicUrl;
            }
        }

        const { error } = await supabase.from("order_timeline").insert({
            order_id: orderId,
            title: stage,
            stage: stage,
            description: description,
            attachment_url: attachmentUrl,
            status: 'Pending', // Needs Admin Approval
            visible_to_buyer: false,
            created_at: new Date().toISOString()
        });

        if (error) throw error;

        revalidatePath(`/dashboard/supplier/orders`);
        return { success: "Update Submitted for Approval" };

    } catch (e: any) {
        return { error: e.message };
    }
}

// ========================================
// PAYMENT & BILLING ACTIONS
// ========================================

export async function uploadInvoice(formData: FormData) {
    const orderId = formData.get("orderId") as string;
    const file = formData.get("file") as File;
    const invoiceNumber = formData.get("invoiceNumber") as string;
    const amount = formData.get("amount") as string;

    if (!file || !orderId || !invoiceNumber || !amount) {
        return { error: "Missing required fields" };
    }

    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        // Upload file
        const fileExt = file.name.split('.').pop();
        const fileName = `Invoice-${invoiceNumber}-${Date.now()}.${fileExt}`;
        const filePath = `invoices/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from("rfq-drawings")
            .upload(filePath, file);

        if (uploadError) throw new Error("File upload failed");

        const { data: { publicUrl } } = supabase.storage.from("rfq-drawings").getPublicUrl(filePath);

        // Create invoice record
        const { error: insertError } = await supabase
            .from("supplier_invoices")
            .insert({
                supplier_id: user.id,
                order_id: orderId,
                invoice_number: invoiceNumber,
                amount: parseFloat(amount),
                invoice_url: publicUrl,
                status: 'Pending'
            });

        if (insertError) throw insertError;

        revalidatePath("/dashboard/supplier/payments");
        return { success: "Invoice uploaded successfully" };

    } catch (e: any) {
        console.error("Error uploading invoice:", e);
        return { error: e.message };
    }
}

export async function uploadDocument(formData: FormData) {
    const orderId = formData.get("orderId") as string;
    const documentType = formData.get("documentType") as string;
    const file = formData.get("file") as File;

    if (!file || !documentType) {
        return { error: "Missing required fields" };
    }

    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        // Upload file
        const fileExt = file.name.split('.').pop();
        const fileName = `${documentType}-${Date.now()}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from("rfq-drawings")
            .upload(filePath, file);

        if (uploadError) throw new Error("File upload failed");

        const { data: { publicUrl } } = supabase.storage.from("rfq-drawings").getPublicUrl(filePath);

        // Create document record
        const { error: insertError } = await supabase
            .from("supplier_documents")
            .insert({
                supplier_id: user.id,
                order_id: orderId || null,
                document_type: documentType,
                document_url: publicUrl,
                document_name: file.name
            });

        if (insertError) throw insertError;

        revalidatePath("/dashboard/supplier/payments");
        return { success: "Document uploaded successfully" };

    } catch (e: any) {
        console.error("Error uploading document:", e);
        return { error: e.message };
    }
}

export async function requestAdvanceSupport(formData: FormData) {
    const amount = formData.get("amount") as string;
    const reason = formData.get("reason") as string;

    if (!amount || !reason) {
        return { error: "Please provide amount and reason" };
    }

    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        // Check eligibility
        const { data: metrics } = await supabase
            .from("supplier_metrics")
            .select("trust_score, orders_completed_count, advance_eligible")
            .eq("id", user.id)
            .single();

        if (!metrics?.advance_eligible) {
            return { error: "You are not eligible for advance support yet. Improve your trust score and complete more orders." };
        }

        // Create advance request
        const { error: insertError } = await supabase
            .from("advance_requests")
            .insert({
                supplier_id: user.id,
                requested_amount: parseFloat(amount),
                reason: reason,
                status: 'Pending'
            });

        if (insertError) throw insertError;

        revalidatePath("/dashboard/supplier/payments");
        return { success: "Advance request submitted successfully. Admin will review it soon." };

    } catch (e: any) {
        console.error("Error requesting advance:", e);
        return { error: e.message };
    }
}

export async function raisePaymentDispute(formData: FormData) {
    const invoiceId = formData.get("invoiceId") as string;
    const reason = formData.get("reason") as string;

    if (!invoiceId || !reason) {
        return { error: "Please provide invoice and reason" };
    }

    const supabase = await createClient();

    try {
        // Update invoice status to Disputed
        const { error: updateError } = await supabase
            .from("supplier_invoices")
            .update({ status: 'Disputed' })
            .eq("id", invoiceId);

        if (updateError) throw updateError;

        // TODO: Create a support ticket or notification for admin
        // For now, just update the status

        revalidatePath("/dashboard/supplier/payments");
        return { success: "Payment dispute raised. Finance team will contact you soon." };

    } catch (e: any) {
        console.error("Error raising dispute:", e);
        return { error: e.message };
    }
}

