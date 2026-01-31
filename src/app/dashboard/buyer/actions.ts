"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitRFQ(formData: FormData) {
    console.time("submitRFQ_Total");
    try {
        // 1. Preparation & Metadata (Sync)
        const file = formData.get("file") as File;
        if (!file) return { error: "No file uploaded." };
        if (file.size > 50 * 1024 * 1024) return { error: "File size exceeds 50MB limit." };

        const rfqNumber = `RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const fileExt = file.name.split(".").pop();
        const fileName = `${rfqNumber}_${Date.now()}.${fileExt}`;
        // Optimization: Use Year/Month based folders to allow parallel processing independent of user ID
        const filePath = `${new Date().getFullYear()}/${fileName}`;

        // Initialize Clients
        const supabase = await createClient();
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const supabaseAdmin = createAdminClient();

        console.time("Parallel_Tasks");

        // 2. Start Parallel Operations (Upload & Auth)

        // Task A: Upload File
        const uploadPromise = supabaseAdmin.storage
            .from("rfq-drawings")
            .upload(filePath, file)
            .then(result => {
                if (result.error) throw new Error("Upload failed: " + result.error.message);
                const { data: { publicUrl } } = supabaseAdmin.storage.from("rfq-drawings").getPublicUrl(filePath);
                return publicUrl;
            });

        // Task B: Get or Create User
        const userPromise = (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) return { userId: user.id, email: user.email };

            // Handle Guest
            const email = formData.get("contact_email") as string;
            const phone = formData.get("contact_phone") as string;
            const name = formData.get("contact_name") as string;

            if (!email || !name || !phone) throw new Error("Name, Email and Phone are required for new partners.");

            // User requested to use Phone Number as the initial password
            const tempPassword = phone;

            // Allow admin to create user without checking session
            const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password: tempPassword,
                email_confirm: true,
                user_metadata: { name: name, phone: phone, role: 'buyer' }
            });

            if (newUser.user) {
                // Background login attempt (non-blocking for the data flow, but wait for cookie set)
                try {
                    await supabase.auth.signInWithPassword({ email, password: tempPassword });
                } catch (e) { console.warn("Auto-login failed", e); }

                return {
                    userId: newUser.user.id,
                    email: newUser.user.email,
                    newAccount: { email, password: tempPassword }
                };
            } else if (signUpError?.message?.includes("already registered")) {
                console.log("User already exists, proceeding as unlinked RFQ");
                return { userId: null, email };
            }

            return { userId: null, email };
        })();

        // 3. Await Parallel Tasks
        const [publicUrl, userData] = await Promise.all([uploadPromise, userPromise]);
        console.timeEnd("Parallel_Tasks");

        // 4. Insert Record
        const { error: dbError } = await supabaseAdmin.from("rfqs").insert({
            user_id: userData.userId,
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
            contact_email: userData.email || formData.get("contact_email"),
            contact_phone: formData.get("contact_phone") || null,
            updated_at: new Date().toISOString()
        });

        if (dbError) throw new Error("Failed to save RFQ details.");

        revalidatePath("/dashboard/buyer");
        console.timeEnd("submitRFQ_Total");
        return {
            success: `Request ${rfqNumber} submitted successfully!`,
            newAccount: userData.newAccount
        };

    } catch (e: any) {
        console.error("Unexpected Error in submitRFQ:", e);
        if (process.env.NODE_ENV === "development") console.timeEnd("submitRFQ_Total");
        return { error: e.message || "An unexpected system error occurred." };
    }
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
