"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitRFQ(formData: FormData) {
    const supabase = await createClient(); // Keep for reading current user if exists

    // Use Admin Client for ALL write operations to avoid RLS/Session race conditions
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabaseAdmin = createAdminClient();

    // 1. Auth Check - Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;
    let userEmail = user?.email;

    // 2. Handle Guest Logic
    if (!userId) {
        const email = formData.get("contact_email") as string;
        const phone = formData.get("contact_phone") as string;
        const name = formData.get("contact_name") as string;

        if (!email || !name || !phone) {
            return { error: "Name, Email and Phone are required for new partners." };
        }
        userEmail = email;

        const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`;

        // Check availability or Create User
        const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: name, phone: phone, role: 'buyer' }
        });

        if (newUser.user) {
            userId = newUser.user.id;
            console.log(`[AUTO-REGISTER] Created new verified user ${userId}`);

            // Attempt to sign them in for the frontend session
            // Note: This sets cookies for the RESPONSE, but won't affect the current running function's "supabase" client
            await supabase.auth.signInWithPassword({
                email,
                password: tempPassword,
            });
        } else {
            console.log("[AUTO-REGISTER] Note:", signUpError?.message);
            // If user exists, we try to use their email to find ID if possible, or proceed as anonymous for now?
            // For Security, if user exists but isn't logged in, we shouldn't link data blindly.
            // But for this MVP, if create fails, we might just proceed with userId = null (or guest)
        }
    }

    // 3. Prepare File Upload 
    const file = formData.get("file") as File;
    if (!file) return { error: "No file uploaded." };

    const rfqNumber = `RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fileExt = file.name.split(".").pop();
    const fileName = `${rfqNumber}_${Date.now()}.${fileExt}`;
    const filePath = `${userId || 'guest'}/${fileName}`;

    // Upload using ADMIN client to bypass any "authenticated only" RLS issues if we are fresh
    const { error: uploadError } = await supabaseAdmin.storage
        .from("rfq-drawings")
        .upload(filePath, file);

    if (uploadError) {
        console.error("Upload Error:", uploadError);
        return { error: "Failed to upload file." };
    }

    const { data: { publicUrl } } = supabaseAdmin.storage.from("rfq-drawings").getPublicUrl(filePath);

    // 4. Insert RFQ Record (Using Admin to ensure Insert RLS doesn't block)
    const { error: dbError } = await supabaseAdmin.from("rfqs").insert({
        user_id: userId || null,
        rfq_number: rfqNumber,
        status: "Pending",
        file_url: publicUrl,
        file_name: file.name,
        type: formData.get("type"),
        quantity: formData.get("quantity") || null,
        lead_time: formData.get("lead_time") || null,
        target_price: formData.get("target_price") || null,
        notes: formData.get("notes") || null,
        contact_name: formData.get("contact_name") || null,
        contact_email: formData.get("contact_email") || null,
        contact_phone: formData.get("contact_phone") || null,
        updated_at: new Date().toISOString()
    });

    if (dbError) {
        console.error("DB Error:", dbError);
        return { error: "Failed to save RFQ details." };
    }

    revalidatePath("/dashboard/buyer");
    return { success: `Request ${rfqNumber} submitted successfully!` };
}

export async function approveQuote(rfqId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("rfqs")
        .update({ status: "Approved", updated_at: new Date().toISOString() })
        .eq("id", rfqId);

    if (error) {
        console.error("Error approving quote:", error);
        return { error: "Failed to approve quote." };
    }

    // Mock Notification
    console.log(`[EMAIL TRIGGER] Sending PO Request to Buyer for RFQ ID: ${rfqId}`);
    console.log(`[EMAIL TRIGGER] Sending Order Confirmed Alert to Admin for RFQ ID: ${rfqId}`);

    revalidatePath("/dashboard/buyer/quotes");
    return { success: "Quote accepted! implementation details moved to 'My Orders'." };
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    // Only revalidate the dashboard, not the whole layout.
    revalidatePath("/dashboard/buyer");
    redirect("/dashboard/buyer");
}
