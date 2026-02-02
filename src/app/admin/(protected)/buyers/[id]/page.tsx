"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, FileText, ShoppingCart, Mail, Phone, Building } from "lucide-react";
import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */

type BuyerProfile = {
    id: string;
    email: string;
    name: string;
    company_name: string;
    phone: string;
    created_at: string;
};

type RFQ = {
    id: string;
    rfq_number: string;
    material: string;
    admin_status: string;
    created_at: string;
};

type Order = {
    id: string;
    order_number: string;
    status: string;
    total_value: number;
    created_at: string;
};

export default function BuyerActivityPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();

    const [profile, setProfile] = useState<BuyerProfile | null>(null);
    const [rfqs, setRfqs] = useState<RFQ[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) fetchBuyerData();
    }, [params.id]);

    const fetchBuyerData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", params.id)
                .single();

            if (profileError) throw profileError;
            setProfile(profileData as any);

            // 2. Fetch their RFQs
            const { data: rfqData } = await supabase
                .from("rfqs")
                .select("*")
                .eq("user_id", params.id)
                .order("created_at", { ascending: false });

            if (rfqData) setRfqs(rfqData as any);

            // 3. Fetch their Orders
            const { data: orderData } = await supabase
                .from("orders")
                .select("*")
                .eq("buyer_id", params.id)
                .order("created_at", { ascending: false });

            if (orderData) setOrders(orderData as any);

        } catch (error: any) {
            console.error("Error fetching buyer detail:", error);
            alert("Failed to fetch buyer details. Check console for error object. " + (error.message || JSON.stringify(error)));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading Buyer Details...</div>;
    if (!profile) return <div className="p-8">Buyer not found.</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-24">
            {/* Header / Profile Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <Link href="/admin/buyers/list" className="mt-1 text-gray-500 hover:text-blue-600">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 uppercase">Buyer</span>
                        </div>
                        <p className="text-gray-500 flex items-center gap-2 mt-1">
                            <Building className="h-4 w-4" /> {profile.company_name || "Company Not Set"}
                        </p>
                        <div className="flex gap-4 mt-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {profile.email}</span>
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {profile.phone || "N/A"}</span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 border-l pl-6">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{rfqs.length}</p>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Total RFQs</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Total Orders</p>
                    </div>
                </div>
            </div>

            {/* Split View: RFQs & Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* RFQs Column */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" /> RFQ History
                        </h2>
                    </div>
                    {rfqs.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">No RFQs submitted yet.</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {rfqs.map(rfq => (
                                <Link href={`/admin/buyers/rfqs/${rfq.id}`} key={rfq.id} className="block p-4 hover:bg-gray-50 transition-colors group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900 group-hover:text-blue-600">{rfq.rfq_number}</p>
                                            <p className="text-sm text-gray-500">{rfq.material}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs px-2 py-1 rounded bg-gray-100 font-medium">{rfq.admin_status}</span>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(rfq.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Orders Column */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-green-500" /> Order History
                        </h2>
                    </div>
                    {orders.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">No Orders yet.</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {orders.map(order => (
                                <Link href={`/admin/buyers/orders/${order.id}`} key={order.id} className="block p-4 hover:bg-gray-50 transition-colors group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900 group-hover:text-blue-600">{order.order_number}</p>
                                            <p className="text-sm text-green-600 font-bold">Value: {order.total_value?.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs px-2 py-1 rounded font-medium ${order.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-50 text-blue-800'
                                                }`}>{order.status}</span>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
