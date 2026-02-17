"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitRFQ(formData: FormData) {
    console.time("submitRFQ_Total");
    try {
        // 1. Preparation & Metadata (Sync)
        const file = formData.get("file") as File;
        const type = formData.get("type") as string;

        // Validation: Main file required for ALL types now
        if (!file) return { error: "No file uploaded." };
        if (file && file.size > 50 * 1024 * 1024) return { error: "File size exceeds 50MB limit." };

        const rfqNumber = `RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        let publicUrl = null;
        let fileName = null;

        // Optimization: Use Year/Month based folders to allow parallel processing independent of user ID
        const filePathBase = `${new Date().getFullYear()}`;

        // Initialize Clients
        const supabase = await createClient();
        const { createAdminClient } = await import("@/lib/supabase/admin");
        const supabaseAdmin = createAdminClient();

        console.time("Parallel_Tasks");

        // 2. Start Parallel Operations (Upload & Auth)

        // Task A: Upload File (Only if exists)
        let uploadPromise = Promise.resolve(null);
        if (file) {
            const fileExt = file.name.split(".").pop();
            fileName = `${rfqNumber}_${Date.now()}.${fileExt}`;
            const filePath = `${filePathBase}/${fileName}`;

            // @ts-ignore
            const { data: buckets } = await supabaseAdmin.storage.listBuckets();
            console.log("AVAILABLE BUCKETS:", buckets?.map(b => b.name));

            uploadPromise = supabaseAdmin.storage
                .from("rfq-drawings")
                .upload(filePath, file)
                .then(result => {
                    if (result.error) throw new Error("Upload failed: " + result.error.message);
                    const { data: { publicUrl } } = supabaseAdmin.storage.from("rfq-drawings").getPublicUrl(filePath);
                    return publicUrl;
                });
        }

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
        const [urlResult, userData] = await Promise.all([uploadPromise, userPromise]);
        publicUrl = urlResult;

        console.timeEnd("Parallel_Tasks");

        // 4. Insert Record
        const { data: rfqData, error: dbError } = await supabaseAdmin.from("rfqs").insert({
            user_id: userData.userId,
            rfq_number: rfqNumber,
            status: "Pending",
            file_url: publicUrl, // Can be null now
            file_name: fileName || (type === "multiple" ? "Multiple Items" : "No File"), // Placeholder or null
            type: type,
            quantity: formData.get("quantity") || null,
            lead_time: formData.get("lead_time") || null,
            target_price: formData.get("target_price") || null,
            notes: formData.get("notes") || null,
            contact_name: formData.get("contact_name") || null,
            contact_email: userData.email || formData.get("contact_email"),
            contact_phone: formData.get("contact_phone") || null,
            updated_at: new Date().toISOString()
        }).select().single();

        if (dbError) throw new Error("Failed to save RFQ details.");

        // 5. Handle Multiple Items
        const rfqType = formData.get("type");
        if (rfqType === "multiple") {
            try {
                const itemsJson = formData.get("items") as string;
                if (itemsJson) {
                    const items = JSON.parse(itemsJson);

                    // Process items
                    const processedItems = items.map((item: any, index: number) => {
                        return {
                            rfq_id: rfqData.id,
                            drawing_number: item.drawing_number,
                            quantity: item.quantity,
                            target_price: item.target_price || null,
                            lead_time: item.lead_time || null,
                            file_url: null, // Sub-items don't have individual files anymore
                            file_name: fileName // Link to parent file name if needed for reference, or null
                        };
                    });

                    if (processedItems.length > 0) {
                        const { error: itemsError } = await supabaseAdmin.from("rfq_items").insert(processedItems);
                        if (itemsError) {
                            console.error("Error inserting RFQ items:", itemsError);
                        }
                    }
                }
            } catch (err) {
                console.error("Error parsing/saving RFQ items:", err);
            }
        }

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

    // 1. Fetch RFQ details
    const { data: rfq, error: rfqError } = await supabase
        .from("rfqs")
        .select("*")
        .eq("id", rfqId)
        .single();

    if (rfqError || !rfq) {
        return { error: "RFQ not found." };
    }

    // 2. Find the WINNING Supplier Quote (matching price)
    // In a real scenario, we might store 'winning_quote_id', but here we match price 
    // or arguably the Admin's 'Sent to Buyer' status implies the last negotiation is the price.
    // However, existing logic in Admin actions uses 'quote_price' to find the supplier quote.
    const { data: supplierQuote } = await supabase
        .from("supplier_quotes")
        .select("*")
        .eq("rfq_id", rfqId)
        .eq("price", rfq.quote_price)
        .maybeSingle();

    // 3. Generate Order Number
    const { count } = await supabase.from("orders").select("*", { count: 'exact', head: true });
    const orderNumber = `ORD-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, '0')}`;

    // 4. Create Order Entry (For Admin Dashboard)
    const { error: orderError } = await supabase.from("orders").insert({
        order_number: orderNumber,
        rfq_id: rfqId,
        buyer_id: rfq.user_id,
        supplier_id: supplierQuote?.supplier_id, // Can be null if manual admin price
        status: "In Progress",
        currency: "INR",
        total_value: rfq.quote_price || 0,
        created_at: new Date().toISOString()
    });

    if (orderError) {
        console.error("Error creating order:", orderError);
        return { error: "Failed to create official order." };
    }

    // 5. Update RFQ Status (For Buyer Dashboard)
    // Use Admin Client to bypass RLS for status updates
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin
        .from("rfqs")
        .update({
            status: "Approved",
            admin_status: "Live Running", // Matches Admin's view logic
            updated_at: new Date().toISOString()
        })
        .eq("id", rfqId);

    if (error) {
        console.error("Error approving quote:", error);
        return { error: "Failed to approve quote." };
    }

    // 6. Update Supplier Quote Status
    if (supplierQuote) {
        await supabaseAdmin
            .from("supplier_quotes")
            .update({ status: "Approved" })
            .eq("id", supplierQuote.id);
    }

    // Mock Notification
    console.log(`[EMAIL TRIGGER] Sending PO Request to Buyer for RFQ ID: ${rfqId}`);
    console.log(`[EMAIL TRIGGER] Sending Order Confirmed Alert to Admin for RFQ ID: ${rfqId}`);

    revalidatePath("/dashboard/buyer/quotes");
    revalidatePath("/dashboard/buyer/orders"); // Refresh Buyer Orders
    revalidatePath("/admin/buyers/rfqs");
    revalidatePath("/admin/buyers/orders"); // Refresh Admin Orders

    return { success: "Quote accepted! Order moved to 'Running Orders'." };
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/");
    redirect("/start/buyer");
}

// Start Negotiation - Buyer clicks "Negotiate" button
export async function startNegotiation(rfqId: string) {
    try {
        const supabase = await createClient();

        // Update BOTH status and admin_status to 'Negotiation'
        // status: for buyer dashboard display
        // admin_status: for admin dashboard filtering
        const { error } = await supabase
            .from("rfqs")
            .update({
                status: 'Negotiation',
                admin_status: 'Negotiation'
            })
            .eq("id", rfqId);

        if (error) {
            console.error("Error starting negotiation:", error);
            return { error: "Failed to start negotiation." };
        }

        // Revalidate both buyer and admin paths
        revalidatePath("/dashboard/buyer/quotes");
        revalidatePath("/admin/buyers/rfqs");

        return { success: true };
    } catch (error) {
        console.error("Start Negotiation Error:", error);
        return { error: "Failed to start negotiation." };
    }
}
