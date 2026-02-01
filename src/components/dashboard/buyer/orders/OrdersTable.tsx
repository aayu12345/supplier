"use client";

import { FileText, Calendar, AlertCircle, RefreshCw, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type RFQ = {
    id: string;
    rfq_number: string;
    file_name: string;
    quantity: number | string;
    lead_time: string;
    status: string; // 'Approved' for orders
    order_status?: "In Progress" | "Dispatched" | "Delivered";
    po_file_url?: string;
    created_at: string;
    updated_at: string;
    // Extended fields for UI display
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    company_name?: string;
    shipping_address?: string;
};

const TABS = ["Running Orders", "Completed Orders"];

export default function OrdersTable() {
    const [activeTab, setActiveTab] = useState("Running Orders");
    const [orders, setOrders] = useState<RFQ[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Debugging
            console.log("Current User:", user.id);

            // Fetch RFQs that are "Approved" (which means they are Orders)
            const { data, error } = await supabase
                .from("rfqs")
                .select("*")
                .eq("user_id", user.id)
                .eq("status", "Approved")
                .order("updated_at", { ascending: false });

            console.log("Fetched Orders:", data);

            if (error) {
                console.error("Supabase Error:", error);
                throw error;
            }
            setOrders(data as unknown as RFQ[]);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRepeatOrder = async (order: RFQ) => {
        if (!confirm(`Are you sure you want to repeat order for ${order.rfq_number}? This will create a new RFQ request.`)) return;

        // Logic to clone RFQ would go here - for now we just show an alert or call a server action
        alert("Repeat order request sent to Admin!");
    };

    const filteredOrders = orders.filter((order) => {
        const isDelivered = order.order_status === "Delivered";
        if (activeTab === "Running Orders") return !isDelivered;
        return isDelivered;
    });

    const getStatusColor = (status?: string) => {
        switch (status) {
            case "In Progress": return "bg-blue-100 text-blue-700";
            case "Dispatched": return "bg-purple-100 text-purple-700";
            case "Delivered": return "bg-emerald-100 text-emerald-700";
            default: return "bg-gray-100 text-gray-600";
        }
    };

    return (
        <div>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-xl px-4 pt-4">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 overflow-hidden min-h-[300px]">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading orders...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">RFQ / Order #</th>
                                    <th className="px-6 py-4">Drawing(s)</th>
                                    <th className="px-6 py-4">Quantity</th>
                                    <th className="px-6 py-4">Lead Time</th>
                                    {activeTab === "Running Orders" && <th className="px-6 py-4">PO Status</th>}
                                    <th className="px-6 py-4">Order Status</th>
                                    <th className="px-6 py-4">Last Updated</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {order.rfq_number}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-700 truncate max-w-[150px]">{order.file_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{order.quantity || '—'}</td>
                                        <td className="px-6 py-4 text-gray-600">{order.lead_time || '—'}</td>

                                        {activeTab === "Running Orders" && (
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${order.po_file_url ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                                    {order.po_file_url ? 'Uploaded' : 'Pending'}
                                                </span>
                                            </td>
                                        )}

                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getStatusColor(order.order_status)}`}>
                                                {order.order_status || 'In Progress'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(order.updated_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/dashboard/buyer/orders/${order.id}`}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
                                                >
                                                    <Eye className="h-3 w-3" /> View
                                                </Link>

                                                {activeTab === "Completed Orders" && (
                                                    <button
                                                        onClick={() => handleRepeatOrder(order)}
                                                        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                                                    >
                                                        <RefreshCw className="h-3 w-3" /> Repeat
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredOrders.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                No {activeTab.toLowerCase()} found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
