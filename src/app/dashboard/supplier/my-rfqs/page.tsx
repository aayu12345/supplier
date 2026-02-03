"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, Clock, CheckCircle, XCircle, Search } from "lucide-react";
import Link from "next/link";

type Quote = {
    id: string;
    created_at: string;
    price: number;
    lead_time: string;
    status: string;
    rfqs: {
        rfq_number: string;
        file_name: string;
        quantity: string;
    } | null;
};

export default function MyRFQsPage() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("All");
    const supabase = createClient();

    useEffect(() => {
        fetchQuotes();
    }, [activeTab]);

    const fetchQuotes = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            let query = supabase
                .from("supplier_quotes")
                .select(`
                    id,
                    created_at,
                    price,
                    lead_time,
                    status,
                    rfqs:rfq_id (
                        rfq_number,
                        file_name,
                        quantity
                    )
                `)
                .eq("supplier_id", user.id)
                .order("created_at", { ascending: false });

            if (activeTab !== "All") {
                query = query.eq("status", activeTab);
            }

            const { data, error } = await query;
            if (error) throw error;
            setQuotes(data as any);
        } catch (err) {
            console.error("Error fetching quotes:", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
            Approved: "bg-green-100 text-green-700 border-green-200",
            Rejected: "bg-red-100 text-red-700 border-red-200",
        };
        return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700";
    };

    const getStatusIcon = (status: string) => {
        if (status === "Approved") return <CheckCircle className="h-4 w-4" />;
        if (status === "Rejected") return <XCircle className="h-4 w-4" />;
        return <Clock className="h-4 w-4" />;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">My RFQs</h1>
                    <p className="text-gray-500">Track your submitted quotes and their status</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="flex border-b border-gray-200">
                        {["All", "Pending", "Approved", "Rejected"].map((tab) => (
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
                    <div className="p-6">
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
                                ))}
                            </div>
                        ) : quotes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <Search className="h-12 w-12 text-gray-300 mb-3" />
                                <p>No quotes found for {activeTab.toLowerCase()} status.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {quotes.map((quote) => (
                                    <div
                                        key={quote.id}
                                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-gray-900">
                                                        {quote.rfqs?.rfq_number || "N/A"}
                                                    </h3>
                                                    <span
                                                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusBadge(
                                                            quote.status
                                                        )}`}
                                                    >
                                                        {getStatusIcon(quote.status)}
                                                        {quote.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {quote.rfqs?.file_name || "Material"}
                                                </p>
                                                <div className="flex gap-4 text-xs text-gray-500">
                                                    <span>
                                                        Qty: <span className="font-medium text-gray-900">{quote.rfqs?.quantity}</span>
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        Price: <span className="font-medium text-gray-900">₹{quote.price}</span>
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        Lead: <span className="font-medium text-gray-900">{quote.lead_time}</span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right text-xs text-gray-400">
                                                {new Date(quote.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
