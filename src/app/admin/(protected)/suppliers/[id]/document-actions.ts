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

    revalidatePath("/admin/suppliers");
    return { success: true };
}
