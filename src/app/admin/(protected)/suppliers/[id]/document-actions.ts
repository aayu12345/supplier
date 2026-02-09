"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Verify a document
export async function verifyDocument(documentId: string, adminNotes?: string) {
    const supabase = await createClient();

    // Get current admin user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    // Update document status to Verified
    const { error } = await supabase
        .from("supplier_documents")
        .update({
            verification_status: "Verified",
            verified_by: user.id,
            verified_at: new Date().toISOString(),
            admin_notes: adminNotes || null,
        })
        .eq("id", documentId);

    if (error) {
        console.error("Verification error:", error);
        return { error: "Failed to verify document" };
    }

    revalidatePath("/admin/suppliers");
    return { success: true };
}

// Helper to send notification
async function sendNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const supabase = await createClient();
    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            title,
            message,
            type,
            is_read: false
        });

    if (error) {
        console.error("Failed to send notification:", error);
    }
}

// Reject a document
export async function rejectDocument(documentId: string, adminNotes: string) {
    const supabase = await createClient();

    // Get current admin user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    if (!adminNotes) {
        return { error: "Please provide a reason for rejection" };
    }

    // First fetch the document to get the supplier_id and document details
    const { data: doc } = await supabase
        .from("supplier_documents")
        .select("supplier_id, document_type, document_name")
        .eq("id", documentId)
        .single();

    if (!doc) {
        return { error: "Document not found" };
    }

    // Update document status to Rejected
    const { error } = await supabase
        .from("supplier_documents")
        .update({
            verification_status: "Rejected",
            verified_by: user.id,
            verified_at: new Date().toISOString(),
            admin_notes: adminNotes,
        })
        .eq("id", documentId);

    if (error) {
        console.error("Rejection error:", error);
        return { error: "Failed to reject document" };
    }

    // Send Notification to Supplier
    await sendNotification(
        doc.supplier_id,
        `Document Rejected: ${doc.document_type}`,
        `Your document "${doc.document_name}" was rejected. Reason: ${adminNotes}. Please re-upload.`,
        'error'
    );

    revalidatePath("/admin/suppliers");
    return { success: true };
}

// Resend Document Request (Manual Trigger)
export async function requestDocumentResubmission(documentId: string, customMessage?: string) {
    const supabase = await createClient();

    // First fetch the document to get the supplier_id and document details
    const { data: doc } = await supabase
        .from("supplier_documents")
        .select("supplier_id, document_type, document_name, admin_notes")
        .eq("id", documentId)
        .single();

    if (!doc) {
        return { error: "Document not found" };
    }

    const reason = customMessage || doc.admin_notes || "Document requires correction.";

    // Send Notification to Supplier
    await sendNotification(
        doc.supplier_id,
        `Action Required: Resubmit ${doc.document_type}`,
        `Admin has requested you to re-upload "${doc.document_name}". Reason: ${reason}`,
        'warning'
    );

    return { success: true };
}
