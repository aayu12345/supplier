"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ActivityType =
    | 'RFQ_ASSIGNED'
    | 'RFQ_PUBLISHED'
    | 'QUOTE_SUBMITTED'
    | 'QUOTE_APPROVED'
    | 'QUOTE_REJECTED'
    | 'DELAY_NOTED'
    | 'PI_UPLOADED'
    | 'SCHEDULE_MISSED';

// Log an activity
export async function logActivity(
    supplierId: string,
    type: ActivityType,
    description: string,
    metadata: any = {},
    rfqId?: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
        .from('quote_activities')
        .insert({
            supplier_id: supplierId,
            activity_type: type,
            description,
            performed_by: user.id, // The logged-in user (Admin or Supplier)
            metadata,
            rfq_id: rfqId || metadata?.rfq_id || null // Try explicit arg or metadata
        });

    if (error) {
        console.error("Failed to log activity:", error);
        return { error: error.message };
    }

    revalidatePath(`/admin/suppliers/${supplierId}`);
    return { success: true };
}

// Fetch activities for a supplier
export async function fetchActivities(supplierId: string) {
    const supabase = await createClient();

    console.log(`[Timeline] Fetching for supplier: ${supplierId}`);
    const { data, error } = await supabase
        .from('quote_activities')
        .select(`
            *,
            rfq:rfq_id (
                rfq_number
            ),
            performer:performed_by (
                name,
                company_name,
                email,
                role
            )
        `)
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("[Timeline] Error fetching activities:", error);
        return [];
    }

    console.log(`[Timeline] Found ${data?.length} activities.`);
    return data;
}
