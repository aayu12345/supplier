"use client";

import { FileText, File, Calendar, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import QuoteDetailModal from "./QuoteDetailModal";

// RFQ Type matching Database
export type RFQ = {
    id: string;
    rfq_number: string;
    file_name: string;
    quantity: number | string;
    lead_time: string; // User requested
    status: "Pending" | "Quoted" | "Negotiation" | "Rejected" | "Approved";
    created_at: string;
    updated_at: string;
    // Quote Details
    quote_price?: number;
    quote_lead_time?: string;
    quote_valid_until?: string;
};

const TABS = ["All RFQs", "Pending", "Quoted", "Rejected", "Negotiation"];

export default function QuotesTable() {
    const [activeTab, setActiveTab] = useState("All RFQs");
    const [selectedQuote, setSelectedQuote] = useState<RFQ | null>(null);
    const [rfqs, setRfqs] = useState<RFQ[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchRFQs();
    }, []);

    const fetchRFQs = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setRfqs([]);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("rfqs")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setRfqs(data as unknown as RFQ[]); // Type assertion for now as DB types might be loose
        } catch (error) {
            console.error("Error fetching RFQs:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRfqs = rfqs.filter((rfq) => {
        if (activeTab === "All RFQs") return rfq.status !== "Approved";
        return rfq.status === activeTab;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Pending":
                return "bg-gray-100 text-gray-600";
            case "Quoted":
                return "bg-blue-100 text-blue-700";
            case "Negotiation":
                return "bg-emerald-100 text-emerald-700";
            case "Rejected":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    const newQuotesCount = rfqs.filter(r => r.status === 'Quoted').length;

    return (
        <div>
            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {newQuotesCount > 0 && (
                /* Notification Banner */
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <div className="bg-yellow-100 p-1 rounded text-yellow-700">
                        <span className="font-bold px-1.5">{newQuotesCount}</span>
                    </div>
                    <div>
                        <p className="text-yellow-800 font-medium">You have {newQuotesCount} active quote(s)</p>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[300px]">
                {loading ? (
                    <div className="animate-pulse">
                        <div className="h-10 bg-gray-100 border-b border-gray-200" />
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100">
                                <div className="h-4 bg-gray-200 rounded w-24 mr-6" />
                                <div className="h-4 bg-gray-200 rounded w-32 mr-6" />
                                <div className="h-4 bg-gray-200 rounded w-16 mr-6" />
                                <div className="h-4 bg-gray-200 rounded w-24 mr-auto" />
                                <div className="h-6 bg-gray-200 rounded w-20" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">RFQ #</th>
                                    <th className="px-6 py-4">Drawing(s)</th>
                                    <th className="px-6 py-4">Quantity</th>
                                    <th className="px-6 py-4">Lead Time</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Last Updated</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRfqs.map((rfq) => (
                                    <tr key={rfq.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{rfq.rfq_number}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-700 truncate max-w-[150px]">{rfq.file_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{rfq.quantity || '—'}</td>
                                        <td className="px-6 py-4 text-gray-600">{rfq.lead_time || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-md text-xs font-bold ${getStatusColor(
                                                    rfq.status
                                                )}`}
                                            >
                                                {rfq.status}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-gray-500`}>{new Date(rfq.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            {rfq.status === 'Pending' ? (
                                                <button className="text-gray-400 hover:text-gray-600 font-medium cursor-default">Pending</button>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedQuote(rfq)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors"
                                                >
                                                    View Quote
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredRfqs.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                No RFQs found in this category.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Quote Detail Modal */}
            {selectedQuote && (
                <QuoteDetailModal
                    isOpen={!!selectedQuote}
                    onClose={() => setSelectedQuote(null)}
                    quote={selectedQuote}
                />
            )}
        </div>
    );
}
