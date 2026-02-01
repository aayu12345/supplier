import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PaymentsPageClient from "./PaymentsPageClient";

export default async function PaymentsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Guest";

    // 1. Fetch Financials (Mock fallback if empty)
    const { data: financialsData } = await supabase
        .from("buyer_financials")
        .select("*")
        .eq("user_id", user.id)
        .single();

    // 2. Fetch Invoices
    const { data: invoicesData } = await supabase
        .from("invoices")
        .select(`*, rfqs(rfq_number)`) // Join to get RFQ #
        .eq("user_id", user.id)
        .order("issued_date", { ascending: false });

    // 3. Fetch Payments
    const { data: paymentsData } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("payment_date", { ascending: false });

    // Transform Data for UI
    // Fallback to defaults if no financials record exists yet
    const financials = {
        credit_terms: financialsData?.credit_terms || "Not Set",
        credit_limit: financialsData?.credit_limit || 0,
        outstanding_balance: financialsData?.outstanding_balance || 0,
        total_paid: paymentsData?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0
    };

    const invoices = (invoicesData || []).map((inv: any) => ({
        ...inv,
        rfq_number: inv.rfqs?.rfq_number || "N/A"
    }));

    return (
        <PaymentsPageClient
            userName={userName}
            isLoggedIn={true}
            financials={financials}
            invoices={invoices}
            payments={paymentsData || []}
        />
    );
}
