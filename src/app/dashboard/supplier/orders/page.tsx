"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Download, Upload, BarChart, ChevronRight, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import UpdateOrderModal from "@/components/dashboard/supplier/UpdateOrderModal";

type Order = {
    id: string;
    rfq_id: string;
    buyer_id: string;
    order_number: string;
    status: string;
    currency: string;
    total_value: number;
    po_url: string;
    pi_url: string;
    created_at: string;
    completed_at: string;
    rfqs: {
        file_name: string;
        material_admin: string;
        quantity: string;
        lead_time_admin: string;
    };
    order_timeline: {
        stage: string;
        status: string;
        created_at: string;
    }[];
};

const STAGES = [
    "Production Started",
    "Material Procurement",
    "Methoding",
    "Machining / Fabrication",
    "Surface Treatment",
    "Quality Control",
    "Packaging",
    "Ready for Dispatch",
    "Shipped",
    "Delivered"
];

export default function SupplierOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Running' | 'Completed'>('Running');

    // updates modal
    const [modalOrder, setModalOrder] = useState<{ id: string, number: string } | null>(null);

    const supabase = createClient();

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    const fetchOrders = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch Orders for this supplier
        // Filter by status roughly based on tab
        const statusFilter = activeTab === 'Completed' ? 'Completed' : 'In Progress'; // Or 'Running' if we used that string.
        // My setup used 'In Progress' default.

        let query = supabase
            .from("orders")
            .select(`
                *,
                rfqs (
                    file_name,
                    material_admin,
                    quantity,
                    lead_time_admin
                ),
                order_timeline (
                    stage,
                    status,
                    created_at
                )
            `)
            .eq("supplier_id", user.id)
            .order("created_at", { ascending: false });

        if (activeTab === 'Completed') {
            query = query.eq("status", "Completed");
        } else {
            // Show everything NOT completed
            query = query.neq("status", "Completed");
        }

        const { data, error } = await query;
        if (error) {
            console.error("Supabase Error:", error);
            console.error("Error details:", JSON.stringify(error, null, 2));
        }
        else setOrders(data as any || []);

        setLoading(false);
    };

    // calculate progress percentage based on last active stage
    const getProgress = (timeline: any[]) => {
        if (!timeline || timeline.length === 0) return 0;
        // Find the latest stage index that is approved or pending
        // Actually, let's just use the count of unique stages completed vs total stages?
        // Or find the index of the last Update's stage in our STAGES array.

        // Sort timeline by date descending
        const sorted = [...timeline].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const lastUpdate = sorted[0];
        if (!lastUpdate) return 0;

        const stageIndex = STAGES.indexOf(lastUpdate.stage);
        if (stageIndex === -1) return 10; // Unknown stage, show small progress

        // Calculate percentage
        return Math.round(((stageIndex + 1) / STAGES.length) * 100);
    };

    const getLatestStage = (timeline: any[]) => {
        if (!timeline || timeline.length === 0) return "Order Placed";
        const sorted = [...timeline].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return sorted[0]?.stage || "Order Placed";
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>

            {/* Tabs */}
            <div className="flex bg-white rounded-lg p-1 border border-gray-200 w-fit mb-8 shadow-sm">
                <button
                    onClick={() => setActiveTab('Running')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'Running'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                >
                    Running Orders
                </button>
                <button
                    onClick={() => setActiveTab('Completed')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'Completed'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                >
                    Completed Orders
                </button>
            </div>

            {loading ? (
                <div className="space-y-6">
                    {[1, 2].map(i => <div key={i} className="h-64 bg-gray-50 animate-pulse rounded-xl" />)}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">No {activeTab.toLowerCase()} orders found.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {orders.map((order, index) => {
                        const progress = getProgress(order.order_timeline);
                        return (
                            <div key={order.id}>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-8">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900">{order.order_number}</h3>
                                                <div className="flex gap-4 mt-2 text-sm">
                                                    <div>
                                                        <span className="text-gray-500 block text-xs uppercase">Quoted Price</span>
                                                        <span className="font-bold text-gray-900 text-lg">₹ {order.total_value.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {/* Download Links */}
                                                {order.pi_url && (
                                                    <a href={order.pi_url} target="_blank" className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline flex items-center gap-1">
                                                        Download Performa Invoice
                                                    </a>
                                                )}
                                                {order.po_url ? (
                                                    <a href={order.po_url} target="_blank" className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline flex items-center gap-1">
                                                        Download Purchase Order
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-400">PO Pending from Buyer</span>
                                                )}

                                                {activeTab === 'Running' && (
                                                    <button
                                                        onClick={() => setModalOrder({ id: order.id, number: order.order_number })}
                                                        className="mt-2 btn-primary px-6 py-2"
                                                    >
                                                        Update Order
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 bg-gray-50 p-4 rounded-lg">
                                            <div>
                                                <span className="text-gray-500 text-xs uppercase block mb-1">Material</span>
                                                <span className="text-gray-900 font-medium">{order.rfqs.material_admin || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 text-xs uppercase block mb-1">Quantity</span>
                                                <span className="text-gray-900 font-medium">{order.rfqs.quantity} <span className="text-xs text-gray-500">Pcs</span></span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 text-xs uppercase block mb-1">Lead Time</span>
                                                <span className="text-gray-900 font-medium">{order.rfqs.lead_time_admin} <span className="text-xs text-gray-500">Days</span></span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 text-xs uppercase block mb-1">Current Status</span>
                                                <span className="text-indigo-600 font-bold">{getLatestStage(order.order_timeline)}</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar Visual */}
                                        <div className="relative pt-6">
                                            <div className="flex justify-between text-xs text-gray-500 font-medium mb-2 px-1">
                                                <span>Started</span>
                                                <span>Work In Progress</span>
                                                <span>Delivered</span>
                                            </div>
                                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-1000 ease-out rounded-full"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            {/* Optional: Add dots on the line */}
                                            <div className="absolute top-7 left-0 w-full flex justify-between px-0.5">
                                                <div className={`h-4 w-4 rounded-full border-2 ${progress > 0 ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'} -mt-1.5`} />
                                                <div className={`h-4 w-4 rounded-full border-2 ${progress >= 50 ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'} -mt-1.5`} />
                                                <div className={`h-4 w-4 rounded-full border-2 ${progress >= 100 ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'} -mt-1.5`} />
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-4 border-t border-gray-100 text-right">
                                            <Link href={`/dashboard/supplier/orders/${order.id}`} className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center justify-end gap-1">
                                                View Full Timeline & Details <ChevronRight className="h-4 w-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Ad Placeholder */}
                                <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-center justify-center h-20">
                                    <div className="text-center">
                                        <p className="font-bold text-gray-800 text-sm">Your Ad Here</p>
                                        <p className="text-xs text-gray-400">Google AdSense</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Update Modal */}
            {modalOrder && (
                <UpdateOrderModal
                    isOpen={!!modalOrder}
                    onClose={() => setModalOrder(null)}
                    orderNumber={modalOrder.number}
                    orderId={modalOrder.id}
                />
            )}
        </div>
    );
}
