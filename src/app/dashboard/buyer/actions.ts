"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitRFQ(formData: FormData) {
    const supabase = await createClient();

    // 1. Auth Check - Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let userId = user?.id;
    let userEmail = user?.email;

    // 2. Prepare File Upload (Start early)
    const file = formData.get("file") as File;
    if (!file) {
        return { error: "No file uploaded." };
    }

    const rfqNumber = `RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const fileExt = file.name.split(".").pop();
    const fileName = `${rfqNumber}_${Date.now()}.${fileExt}`;
    // Use a temporary path or 'guest' if userId is not known yet. 
    // We will use 'guest' prefix for anonymous uploads to allow parallelization.
    // If we want to move it later we can, but 'guest' folder is fine for now.
    const filePath = `${userId || 'guest'}/${fileName}`;

    const uploadPromise = supabase.storage
        .from("rfq-drawings")
        .upload(filePath, file);

    // 3. Handle Guest Auth (Parallel with Upload)
    let authPromise = Promise.resolve(); // Default resolved

    if (!userId) {
        const email = formData.get("contact_email") as string;
        const phone = formData.get("contact_phone") as string;
        const name = formData.get("contact_name") as string;

        if (!email || !name || !phone) {
            return { error: "Name, Email and Phone are required for new partners." };
        }
        userEmail = email;

        // Wrap auth logic in a promise function
        authPromise = (async () => {
            const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`;

            // Use Admin Client for verified creation
            const { createAdminClient } = await import("@/lib/supabase/admin");
            const supabaseAdmin = createAdminClient();

            const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password: tempPassword,
                email_confirm: true,
                user_metadata: { full_name: name, phone: phone, role: 'buyer' }
            });

            if (newUser.user) {
                userId = newUser.user.id;
                console.log(`[AUTO-REGISTER] Created new verified user ${userId} for ${email}`);

                // Auto-Login
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password: tempPassword,
                });

                if (signInError) {
                    console.error("Auto-login failed:", signInError.message);
                } else {
                    console.log("[AUTO-REGISTER] Auto-login successful.");
                }

            } else {
                // If it fails (e.g. user already exists), we just log it and proceed without linking
                // or we could try to sign in if we knew the password (which we don't for existing users).
                console.log("[AUTO-REGISTER] User might exist or could not be created:", signUpError?.message);
            }
        })();
    }

    // 4. Wait for both Key Tasks
    const [uploadResult] = await Promise.all([uploadPromise, authPromise]);

    if (uploadResult.error) {
        console.error("Upload Error:", uploadResult.error);
        return { error: "Failed to upload file." };
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from("rfq-drawings")
        .getPublicUrl(filePath);

    // 5. Insert RFQ Record (Must happen after Auth to get userId potentially)
    const { error: dbError } = await supabase.from("rfqs").insert({
        user_id: userId || null, // Updated by authPromise if successful
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

    // 6. Trigger Notifications (Mock)
    console.log(`[EMAIL TRIGGER] Sending RFQ Received Email to: ${userEmail}`);
    if (!userId) {
        console.log(`[EMAIL TRIGGER] Sending Welcome Email to New Buyer: ${userEmail}`);
    }
    console.log(`[EMAIL TRIGGER] Sending New RFQ Alert ${rfqNumber} to Admin`);

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
