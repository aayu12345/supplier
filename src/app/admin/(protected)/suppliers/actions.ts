"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSupplierStatus(supplierId: string, newStatus: string) {
    try {
        const supabase = await createClient();

        // Upsert into supplier_status table (separate from profiles)
        const { error } = await supabase
            .from("supplier_status")
            .upsert({
                supplier_id: supplierId,
                status: newStatus,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'supplier_id'
            });

        if (error) {
            console.error("Database error:", error);
            return { error: error.message };
        }

        revalidatePath("/admin/suppliers");
        return { success: true };
    } catch (err: any) {
        console.error("Error updating supplier status:", err);
        return { error: err.message || "Failed to update status" };
    }
}
