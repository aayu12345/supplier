"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, CheckCircle, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

type Order = {
    id: string;
    order_number: string;
    status: string;
    po_url?: string;
    pi_url?: string;
    created_at: string;
    rfqs: {
        rfq_number: string;
    } | null; // Join result
    profiles: {
        name: string;
        company_name: string;
    } | null; // Buyer
};

export default function AdminOrdersPage() {
    const [activeTab, setActiveTab] = useState("Running Orders");
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchOrders();
    }, [activeTab]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Determine status filter
            const isCompleted = activeTab === "Completed Orders";

            let query = supabase
                .from("orders")
                .select(`
                    id,
                    order_number,
                    status,
                    po_url,
                    pi_url,
                    created_at,
                    rfqs:rfq_id (rfq_number),
                    profiles:buyer_id (name, company_name)
                `)
                .order("created_at", { ascending: false });

            if (isCompleted) {
                query = query.eq("status", "Completed");
            } else {
                query = query.neq("status", "Completed");
            }

            const { data, error } = await query;

            if (error) throw error;
            setOrders(data as any);
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[600px]">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                {["Running Orders", "Completed Orders"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === tab
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-0">
                {loading ? (
                    <div className="p-8 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <FileText className="h-12 w-12 text-gray-300 mb-2" />
                        <p>No {activeTab.toLowerCase()} found.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Order #</th>
                                <th className="px-6 py-4 font-semibold">Buyer</th>
                                <th className="px-6 py-4 font-semibold">RFQ #</th>
                                <th className="px-6 py-4 font-semibold">PO / PI</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        {order.order_number}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-900">{order.profiles?.company_name || "Unknown Company"}</p>
                                            <p className="text-gray-500 text-xs">{order.profiles?.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {order.rfqs?.rfq_number || "N/A"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <span className={`h-6 w-6 rounded-full flex items-center justify-center ${order.po_url ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                                                <span className="text-[10px] font-bold">PO</span>
                                            </span>
                                            <span className={`h-6 w-6 rounded-full flex items-center justify-center ${order.pi_url ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                                                <span className="text-[10px] font-bold">PI</span>
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${order.status === 'Completed'
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/buyers/orders/${order.id}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            View
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
