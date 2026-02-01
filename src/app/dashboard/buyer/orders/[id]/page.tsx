import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import DashboardHeader from "@/components/dashboard/buyer/DashboardHeader";
import OrderSummary from "@/components/dashboard/buyer/orders/OrderSummary";
import OrderTimeline, { TimelineEvent } from "@/components/dashboard/buyer/orders/OrderTimeline";
import SupportBox from "@/components/dashboard/buyer/orders/SupportBox";
import { RFQ } from "@/components/dashboard/buyer/orders/OrdersTable"; // Reusing type

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    // Fetch RFQ Details
    const { data: order, error } = await supabase
        .from("rfqs")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    console.log("Order Detail Query Result:", { order, error });

    if (error || !order) {
        return (
            <div className="p-8 text-red-600 bg-red-50 border border-red-200 rounded-xl m-8">
                <h1 className="text-2xl font-bold mb-4">Debug: Order Not Found</h1>
                <p><strong>URL Param ID:</strong> {id}</p>
                <p><strong>Current User ID:</strong> {user.id}</p>
                <p><strong>Supabase Error:</strong> {JSON.stringify(error)}</p>
                <p className="mt-4 text-gray-700">Please verify that the RFQ exists and belongs to this user.</p>
                <Link href="/dashboard/buyer/orders" className="text-blue-600 hover:underline mt-4 block">Back to Orders</Link>
            </div>
        );
    }

    // Fetch Timeline
    const { data: timelineData } = await supabase
        .from("order_timeline")
        .select("*")
        .eq("rfq_id", id)
        .order("created_at", { ascending: false });

    // Fetch Profile Data for Shipping/Billing Info
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Guest";

    // Merge RFQ contact info with Profile info (RFQ takes precedence if exists, else Profile)
    const displayOrder = {
        ...order,
        contact_name: order.contact_name || profile?.contact_person || profile?.full_name || userName,
        contact_email: order.contact_email || user.email,
        contact_phone: order.contact_phone || profile?.phone,
        company_name: profile?.company_name,
        shipping_address: profile?.address
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    {/* We can simplify the header here or reuse main, let's keep it simple for detail view */}
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/buyer/orders" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                Order #{order.rfq_number}
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${order.order_status === "Delivered" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                                    }`}>
                                    {order.order_status || "In Progress"}
                                </span>
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Summary (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <OrderSummary order={displayOrder as unknown as RFQ} />
                        <div className="hidden lg:block">
                            <SupportBox rfqNumber={order.rfq_number} />
                        </div>
                    </div>

                    {/* Middle Column: Timeline (8 cols) */}
                    <div className="lg:col-span-8">
                        <OrderTimeline events={timelineData as unknown as TimelineEvent[]} />
                    </div>

                    {/* Mobile Only Support */}
                    <div className="lg:hidden col-span-1">
                        <SupportBox rfqNumber={order.rfq_number} />
                    </div>

                </div>
            </div>
        </div>
    );
}
