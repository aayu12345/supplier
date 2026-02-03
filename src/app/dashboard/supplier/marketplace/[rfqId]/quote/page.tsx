import { createClient } from "@/lib/supabase/server";
import QuoteForm from "./quote-form";
import { notFound } from "next/navigation";

export default async function QuotePage({ params }: { params: Promise<{ rfqId: string }> }) {
    const { rfqId } = await params;
    const supabase = await createClient();

    // Fetch RFQ details
    const { data: rfq, error } = await supabase
        .from("rfqs")
        .select("*")
        .eq("id", rfqId)
        .eq("admin_status", "Live")
        .single();

    if (error || !rfq) {
        notFound();
    }

    // Check if cost breakdown is enabled (for now, default to false)
    // TODO: Fetch from admin settings table when implemented
    const costBreakdownEnabled = false;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <QuoteForm rfq={rfq} costBreakdownEnabled={costBreakdownEnabled} />
        </div>
    );
}
