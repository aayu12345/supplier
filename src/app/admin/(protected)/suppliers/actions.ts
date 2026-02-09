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

export async function getAdminSupplierStats() {
    const supabase = await createClient();

    try {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString(); // Start of current week (Sunday)

        // 1. Total Suppliers
        const { count: totalSuppliers, error: totalError } = await supabase
            .from("profiles")
            .select("*", { count: 'exact', head: true })
            .contains("role", ["supplier"]);

        if (totalError) throw totalError;

        // 2. Active Suppliers (Last 7 Days - Submitted a Quote)
        // We fetch distinct supplier_ids from quotes table
        const { data: activeQuotes, error: activeError } = await supabase
            .from("supplier_quotes")
            .select("supplier_id")
            .gte("created_at", sevenDaysAgo);

        if (activeError) throw activeError;
        const activeSuppliersCount = new Set(activeQuotes?.map(q => q.supplier_id)).size;

        // 3. Idle Suppliers (> 30 Days No Quote)
        // We find suppliers who HAVE quoted in last 30 days, and subtract from total
        const { data: recentQuotes, error: recentError } = await supabase
            .from("supplier_quotes")
            .select("supplier_id")
            .gte("created_at", thirtyDaysAgo);

        if (recentError) throw recentError;
        const recentActiveSuppliersCount = new Set(recentQuotes?.map(q => q.supplier_id)).size;
        const idleSuppliersCount = (totalSuppliers || 0) - recentActiveSuppliersCount;

        // 4. Avg Trust Score
        const { data: metrics, error: metricsError } = await supabase
            .from("supplier_metrics")
            .select("trust_score");

        if (metricsError) throw metricsError;
        const totalScore = metrics?.reduce((sum, m) => sum + (m.trust_score || 0), 0) || 0;
        const avgTrustScore = metrics?.length ? (totalScore / metrics.length).toFixed(1) : "0.0";

        // 5. Avg Quote Time (Quote Time - RFQ Creation Time)
        // Fetch last 100 quotes to calculate average (for performance)
        const { data: quotesData, error: quotesError } = await supabase
            .from("supplier_quotes")
            .select("created_at, rfq:rfqs(created_at)")
            .order("created_at", { ascending: false })
            .limit(100);

        if (quotesError) throw quotesError;

        let totalTimeDiff = 0;
        let validQuoteCount = 0;

        quotesData?.forEach((quote: any) => {
            if (quote.created_at && quote.rfq?.created_at) {
                const quoteTime = new Date(quote.created_at).getTime();
                const rfqTime = new Date(quote.rfq.created_at).getTime();
                const diff = quoteTime - rfqTime;
                if (diff > 0) {
                    totalTimeDiff += diff;
                    validQuoteCount++;
                }
            }
        });

        let avgQuoteTime = "N/A";
        if (validQuoteCount > 0) {
            const avgMs = totalTimeDiff / validQuoteCount;
            const avgHours = avgMs / (1000 * 60 * 60);
            if (avgHours < 24) {
                avgQuoteTime = `${avgHours.toFixed(1)} Hrs`;
            } else {
                avgQuoteTime = `${(avgHours / 24).toFixed(1)} Days`;
            }
        }

        // 6. Quotes Submitted This Week
        const { count: quotesThisWeek, error: weeklyError } = await supabase
            .from("supplier_quotes")
            .select("*", { count: 'exact', head: true })
            .gte("created_at", startOfWeek);

        if (weeklyError) throw weeklyError;

        return {
            totalSuppliers: totalSuppliers || 0,
            activeSuppliers: activeSuppliersCount,
            idleSuppliers: Math.max(0, idleSuppliersCount), // Safety check
            avgTrustScore,
            avgQuoteTime,
            quotesThisWeek: quotesThisWeek || 0
        };

    } catch (error: any) {
        console.error("Error fetching supplier stats:", error);
        return { error: error.message };
    }
}
