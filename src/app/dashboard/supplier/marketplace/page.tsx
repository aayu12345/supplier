"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, Search, Package, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

type RFQ = {
    id: string;
    rfq_number: string;
    file_name: string;
    quantity: string;
    lead_time: string;
    created_at: string;
    type: string;
};

export default function MarketplacePage() {
    const [rfqs, setRfqs] = useState<RFQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();

    useEffect(() => {
        fetchRFQs();
    }, []);

    const fetchRFQs = async () => {
        setLoading(true);
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get RFQ IDs that this supplier has already quoted on
            const { data: quotedRfqIds } = await supabase
                .from("supplier_quotes")
                .select("rfq_id")
                .eq("supplier_id", user.id);

            const quotedIds = quotedRfqIds?.map(q => q.rfq_id) || [];

            // Fetch Live RFQs
            let query = supabase
                .from("rfqs")
                .select("*")
                .eq("admin_status", "Live");

            // Only exclude if there are quoted RFQs
            if (quotedIds.length > 0) {
                query = query.not("id", "in", `(${quotedIds.join(',')})`);
            }

            const { data, error } = await query.order("created_at", { ascending: false });

            if (error) throw error;
            setRfqs(data as any);
        } catch (err) {
            console.error("Error fetching RFQs:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredRfqs = rfqs.filter((rfq) =>
        rfq.rfq_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">RFQ Marketplace</h1>
                    <p className="text-gray-500">Browse and quote on live RFQs</p>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by RFQ number or material..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* RFQ List */}
                <div className="space-y-4">
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />
                        ))
                    ) : filteredRfqs.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No RFQs Found</h3>
                            <p className="text-gray-500">
                                {searchTerm ? "Try a different search term" : "No live RFQs available at the moment"}
                            </p>
                        </div>
                    ) : (
                        filteredRfqs.map((rfq) => (
                            <div
                                key={rfq.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-blue-300 transition-colors"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-gray-900">{rfq.rfq_number}</h3>
                                            <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                                Live
                                            </span>
                                        </div>
                                        <p className="text-gray-900 font-medium">{rfq.file_name}</p>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Package className="h-4 w-4" />
                                                Qty: <span className="font-medium text-gray-900">{rfq.quantity}</span>
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                Lead: <span className="font-medium text-gray-900">
                                                    {rfq.lead_time ? new Date(rfq.lead_time).toLocaleDateString() : "N/A"}
                                                </span>
                                            </span>
                                            <span>•</span>
                                            <span className="text-xs text-gray-400">
                                                Posted: {new Date(rfq.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/dashboard/supplier/marketplace/${rfq.id}/quote`}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors"
                                    >
                                        Start Quoting
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
