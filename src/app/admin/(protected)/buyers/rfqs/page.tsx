"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";

type AdminRFQ = {
    id: string;
    rfq_number: string;
    file_name: string;
    created_at: string;
    admin_status: 'New' | 'Live' | 'Quoted' | 'Sent to Buyer' | 'Approved' | 'Rejected';
    profiles: {
        name: string;
        company_name: string;
        email: string;
    };
    visibility_expires_at?: string;
    supplier_quotes?: { count: number }[];
    components_count?: number;
};

const TABS = ["New", "Live", "Quoted", "Sent to Buyer", "Approved", "Rejected"];

export default function AdminRFQsPage() {
    const [activeTab, setActiveTab] = useState("New");
    const [rfqs, setRfqs] = useState<AdminRFQ[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchRFQs();
    }, [activeTab]);

    const fetchRFQs = async () => {
        setLoading(true);
        // Determine status filter based on tab
        // If "New", maybe we want 'New' status.
        // Assuming tab names match status exactly for simplicity.

        try {
            const { data, error } = await supabase
                .from("rfqs")
                .select(`
                    id,
                    rfq_number,
                    file_name,
                    created_at,
                    admin_status,
                    visibility_expires_at,
                    supplier_quotes(count),
                    profiles:user_id (
                        name,
                        company_name,
                        email
                    )
                `)
                .eq("admin_status", activeTab)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching RFQs (Full):", JSON.stringify(error, null, 2));
                console.error("Error Message:", error.message);
            } else {
                setRfqs(data as unknown as AdminRFQ[]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab
                            ? "bg-white text-blue-600 border-b-2 border-blue-600 -mb-[2px]"
                            : "bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        {tab}
                        {/* Optional: Add counters here later */}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="p-8 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                        ))}
                    </div>
                ) : rfqs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <FileText className="h-12 w-12 text-gray-300 mb-2" />
                        <p>No RFQs found in "{activeTab}"</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">RFQ Details</th>
                                <th className="px-6 py-4 font-semibold">Buyer</th>
                                <th className="px-6 py-4 font-semibold">{activeTab === 'Live' ? 'Visibility Ends' : 'Date Uploaded'}</th>
                                {activeTab === 'Live' && <th className="px-6 py-4 font-semibold">Quotes Received</th>}
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rfqs.map((rfq) => (
                                <tr key={rfq.id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{rfq.rfq_number}</p>
                                                <p className="text-sm text-gray-500 truncate max-w-[200px]">{rfq.file_name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm">
                                            <p className="font-medium text-gray-900">
                                                {rfq.profiles?.name || "Unknown"}
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                {rfq.profiles?.company_name || rfq.profiles?.email}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {activeTab === 'Live' && rfq.visibility_expires_at ? (
                                            <div>
                                                <p>{new Date(rfq.visibility_expires_at).toLocaleDateString()}</p>
                                                {new Date(rfq.visibility_expires_at) < new Date(Date.now() + 86400000 * 2) && (
                                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Expiring Soon</span>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                {new Date(rfq.created_at).toLocaleDateString()}
                                                <br />
                                                <span className="text-xs text-gray-400">
                                                    {new Date(rfq.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </>
                                        )}
                                    </td>
                                    {activeTab === 'Live' && (
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900">{rfq.supplier_quotes?.[0]?.count || 0}</span>
                                                <span className="text-gray-500 text-xs">quotes</span>
                                            </div>
                                            {(rfq.supplier_quotes?.[0]?.count || 0) === 0 && (
                                                <span className="text-xs text-gray-400">No quotes yet</span>
                                            )}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/buyers/rfqs/${rfq.id}`}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all shadow-sm"
                                        >
                                            View & Manage
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
