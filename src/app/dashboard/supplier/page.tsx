
import { Factory, TrendingUp, AlertCircle, Search, Package, CreditCard, ChevronRight, Star, Settings, FileText, BarChart3, User } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// --- Components ---

// 1. Unified Hero Section (Stats + Performance)
function DashboardHero({ metrics }: { metrics: any }) {
    // Default values if metrics are missing
    const stats = {
        rfqs: metrics?.rfqs || 0,
        ordersProcess: metrics?.ordersProcess || 0,
        ordersCompleted: metrics?.ordersCompleted || 0,
        trustScore: metrics?.trustScore || 0.0,
        ratings: metrics?.ratings || {}
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Key Stats */}
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total RFQs</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.rfqs}</h3>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <Package className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Orders in Process</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.ordersProcess}</h3>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Orders Completed</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.ordersCompleted}</h3>
                    </div>
                </div>
            </div>

            {/* Right: Performance */}
            <div className="border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Performance</h3>
                        <p className="text-gray-500 text-sm">Trust Score: <span className="text-gray-900 font-bold">{stats.trustScore}</span></p>
                    </div>
                </div>

                <div className="space-y-4">
                    <PerformanceBar label="Timing" score={stats.ratings?.timing || 0} color="bg-blue-500" />
                    <PerformanceBar label="Quality" score={stats.ratings?.quality || 0} color="bg-green-500" />
                    <PerformanceBar label="Packaging" score={stats.ratings?.packaging || 0} color="bg-purple-500" />
                    <PerformanceBar label="Communication" score={stats.ratings?.communication || 0} color="bg-orange-500" />
                </div>
            </div>
        </div>
    );
}

function PerformanceBar({ label, score, color }: { label: string, score: number, color: string }) {
    return (
        <div className="flex items-center gap-4">
            <span className="w-24 text-sm font-medium text-gray-600">{label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                <div className={`${color} h-2.5 rounded-full`} style={{ width: `${score}%` }}></div>
            </div>
        </div>
    );
}

// 2. Action Tile (Square)
function ActionTile({ icon: Icon, label, href, colorClass }: { icon: any, label: string, href: string, colorClass: string }) {
    return (
        <Link href={href} className="group flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all h-32">
            <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 mb-2 group-hover:scale-110 transition-transform`}>
                <Icon className={`h-6 w-6 ${colorClass.replace("bg-", "text-")}`} />
            </div>
            <span className="font-semibold text-gray-900 text-sm text-center leading-tight">{label}</span>
        </Link>
    );
}

// 3. RFQ Card (Clean Row Style)
function RFQCard({ rfq }: { rfq: any }) {
    const leadTimeDisplay = rfq.lead_time ? new Date(rfq.lead_time).toLocaleDateString() : 'N/A';

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-300 transition-colors">
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <h4 className="text-lg font-extrabold text-gray-900">{rfq.rfq_number}</h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                        Open
                    </span>
                </div>
                {/* Using file_name as material name for now, as typical in this setup */}
                <p className="text-gray-900 font-medium truncate max-w-md">{rfq.file_name}</p>
                <div className="flex gap-4 text-sm text-gray-500">
                    <span>Quantity: <span className="text-gray-900 font-medium">{rfq.quantity}</span></span>
                    <span>•</span>
                    <span>Lead Date: <span className="text-gray-900 font-medium">{leadTimeDisplay}</span></span>
                </div>
            </div>

            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                <div className="text-right hidden md:block">
                    <span className="text-xs text-gray-400">Status</span>
                    <p className="font-medium text-gray-900">Live</p>
                </div>
                <Link href={`/dashboard/supplier/marketplace/${rfq.id}/quote`} className="w-full md:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors text-center">
                    Start Quoting
                </Link>
            </div>
        </div>
    );
}

// 4. Ad Banner (Yellow/Google Style)
function AdBanner() {
    return (
        <div className="w-full h-[90px] bg-yellow-300 rounded-lg flex items-center justify-center relative overflow-hidden border border-yellow-400">
            <div className="absolute top-2 left-2 bg-white px-1 rounded text-[10px] font-bold text-gray-400 uppercase">Ad</div>
            <div className="text-center">
                <h3 className="font-bold text-gray-900 text-lg">Your Ad Title Here</h3>
                <p className="text-gray-700 text-sm">www.example.com</p>
            </div>
            <span className="absolute bottom-2 right-2 text-gray-500 text-xs font-medium">Google</span>
        </div>
    );
}


export default async function SupplierDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get RFQ IDs that this supplier has already quoted on
    let quotedRfqIds: string[] = [];
    if (user) {
        const { data: quotedData } = await supabase
            .from("supplier_quotes")
            .select("rfq_id")
            .eq("supplier_id", user.id);
        quotedRfqIds = quotedData?.map(q => q.rfq_id) || [];
    }

    // 1. Fetch Live RFQs (Marketplace) - Exclude already quoted RFQs
    let liveRfqsQuery = supabase
        .from('rfqs')
        .select('*', { count: 'exact' })
        .eq('admin_status', 'Live');

    // Exclude quoted RFQs if there are any
    if (quotedRfqIds.length > 0) {
        liveRfqsQuery = liveRfqsQuery.not('id', 'in', `(${quotedRfqIds.join(',')})`);
    }

    const { data: liveRfqs, count: liveRfqsCount } = await liveRfqsQuery.order('created_at', { ascending: false });

    // Get count of supplier's quoted RFQs
    const myQuotedRfqsCount = quotedRfqIds.length;

    // 2. Fetch Supplier Metrics (Stats & Trust Score)
    // Total RFQs = Available RFQs (unquoted) + My Quoted RFQs
    let stats = {
        rfqs: (liveRfqsCount || 0) + myQuotedRfqsCount, // Total = Marketplace + My RFQs
        ordersProcess: 0,
        ordersCompleted: 0,
        trustScore: 4.7,
        ratings: { timing: 80, quality: 95, packaging: 70, communication: 90 }
    };

    if (user) {
        const { data: metricsData } = await supabase
            .from('supplier_metrics')
            .select('*')
            .eq('id', user.id)
            .single();

        if (metricsData) {
            stats.ordersProcess = metricsData.orders_in_process_count || 0;
            stats.ordersCompleted = metricsData.orders_completed_count || 0;
            stats.trustScore = metricsData.trust_score || 4.7;
            stats.ratings = metricsData.performance_ratings || stats.ratings;
        }
    }

    const displayRfqs = liveRfqs || [];

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

                {/* 1. HERO SECTION */}
                <DashboardHero metrics={stats} />

                {/* 2. ACTION TILES (3 Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ActionTile
                        icon={FileText}
                        label="View RFQs"
                        href="/dashboard/supplier/marketplace"
                        colorClass="bg-blue-500"
                    />
                    <ActionTile
                        icon={Package}
                        label="My RFQs"
                        href="/dashboard/supplier/my-rfqs"
                        colorClass="bg-purple-500"
                    />
                    <ActionTile
                        icon={CreditCard}
                        label="Billing / Payment"
                        href="/dashboard/supplier/payments"
                        colorClass="bg-green-500"
                    />
                </div>

                {/* 3. RFQ FEED */}
                <div className="space-y-4">
                    {displayRfqs.length > 0 ? (
                        displayRfqs.map((rfq, index) => {
                            // Ad Logic: After every 2 cards
                            const showAd = (index + 1) % 2 === 0 && index !== displayRfqs.length - 1;

                            return (
                                <div key={rfq.id}>
                                    <RFQCard rfq={rfq} />
                                    {showAd && (
                                        <div className="mt-4 mb-4">
                                            <AdBanner />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                            <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">No Live RFQs</h3>
                            <p className="text-gray-500">New opportunities will appear here once approved by Admin.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
