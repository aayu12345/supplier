import { createClient } from "@/lib/supabase/server";


export default async function MyOrdersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch profile name logic similar to dashboard
    const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Guest";

    return (
        <div className="min-h-screen bg-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Reusing existing Header - we might need to make it smarter about navigation later */}
                {/* Wrapper component needed for client-side interactions in server page */}
                <OrdersPageClient userName={userName} isLoggedIn={!!user} />
            </div>
        </div>
    );
}

// Inline client wrapper for now to reuse the Header logic
import OrdersPageClient from "@/app/dashboard/buyer/orders/OrdersPageClient";
