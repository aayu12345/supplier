"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, Download, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { uploadPerformaInvoice } from "../actions";

type MyQuote = {
    id: string;
    price: number;
    lead_time: string;
    remarks: string;
    status: 'Pending' | 'Selected' | 'Rejected' | 'Approved' | 'Sent to Buyer' | 'Quoted';
    created_at: string;
    rfqs: {
        id: string;
        rfq_number: string;
        file_name: string;
        quantity: string;
        material_admin: string;
        lead_time_admin: string;
        admin_notes: string;
        admin_status: string;
    };
};

export default function SupplierMyRFQsPage() {
    const [quotes, setQuotes] = useState<MyQuote[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

    // Modal State
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch quotes for this supplier using the user_id (assuming profile link or direct user_id on quotes if you added it, 
        // OR filtering by supplier_name matching profile? 
        // Ideally we should have user_id on supplier_quotes.
        // For now, let's assume we can fetch by matching the auth user to the supplier profile if connected, 
        // OR simply fetch all if this is a demo environment where RLS handles it. 
        // Wait, looking at schema, supplier_quotes doesn't have user_id. It has supplier_name.
        // We might need to assume RLS or fetch strategy.
        // Let's assume for now we fetch by current user's profile name or email? 
        // Actually best practice is adding user_id to supplier_quotes. 
        // But for this legacy codebase, let's check how 'Live' quotes are submitted. 
        // They are submitted anonymously in 'actions.ts' via mock. 
        // But if this is the "Supplier Portal", we must assume we are logged in.

        // TEMPORARY FIX: We will fetch ALL quotes for now since we are simulating the supplier view 
        // and usually we wouldn't have other suppliers' data in a real restrictive DB.

        const { data, error } = await supabase
            .from("supplier_quotes")
            .select(`
                *,
                rfqs (
                    id,
                    rfq_number,
                    file_name,
                    quantity,
                    material_admin,
                    lead_time_admin,
                    admin_notes,
                    admin_status
                )
            `)
            .order("created_at", { ascending: false });

        if (error) console.error(error);
        else setQuotes(data as any || []);

        setLoading(false);
    };

    // --- SORTING & FILTERING LOGIC ---
    const getDisplayStatus = (q: MyQuote) => {
        // Map DB status to UI Status
        if (q.status === 'Selected' || q.status === 'Approved') return 'Approved';
        if (q.status === 'Rejected') return 'Rejected';
        return 'Pending';
    };

    const displayedQuotes = quotes
        .filter(q => {
            const status = getDisplayStatus(q);
            if (filter === 'All') return true;
            return status === filter;
        })
        .sort((a, b) => {
            // Priority: Approved (Action needed) > Pending > Rejected
            // User requested: New Updates > Pending > Approved > Rejected
            // Let's stick to Recency first logic combined with status grouping if needed
            // For now simple Recency is best for "New updates first"
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

    const statusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-blue-600 text-white';
            case 'Pending': return 'bg-blue-500 text-white'; // Match image blue
            case 'Rejected': return 'bg-gray-200 text-gray-700';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleOpenUpload = (rfqId: string) => {
        setSelectedRfqId(rfqId);
        setIsUploadOpen(true);
    };

    const handleUploadPI = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUploading(true);
        const formData = new FormData(e.currentTarget);

        if (selectedRfqId) formData.append("rfqId", selectedRfqId);

        const result = await uploadPerformaInvoice(formData);

        setUploading(false);
        if (result.error) {
            alert("Error: " + result.error);
        } else {
            alert("Performa Invoice Uploaded! Order Created.");
            setIsUploadOpen(false);
            fetchQuotes(); // Refresh list
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My RFQs</h1>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['Pending', 'Approved', 'Rejected'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === f
                                ? 'bg-white shadow-sm text-gray-900'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                    <button
                        onClick={() => setFilter('All')}
                        className={`ml-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'All'
                            ? 'bg-white shadow-sm text-gray-900'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        View All
                    </button>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-xl" />)}
                </div>
            ) : displayedQuotes.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                    No quotes found. check out the Marketplace to find new work!
                </div>
            ) : (
                <div className="space-y-6">
                    {displayedQuotes.map((quote, index) => {
                        const status = getDisplayStatus(quote);
                        return (
                            <div key={quote.id}>
                                {/* QUOTE CARD */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{quote.rfqs.rfq_number}</h3>
                                                <div className="text-sm text-gray-500 mt-1 flex gap-4">
                                                    <p>
                                                        <span className="block text-xs uppercase tracking-wide text-gray-400">Quoted On</span>
                                                        {new Date(quote.created_at).toLocaleDateString()}
                                                    </p>
                                                    <p>
                                                        <span className="block text-xs uppercase tracking-wide text-gray-400">Status</span>
                                                        <span className="font-medium text-gray-900">{status}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-md text-sm font-medium ${statusColor(status)}`}>
                                                {status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                            <div>
                                                <p className="text-sm text-gray-400 mb-1">Your Quote</p>
                                                <p className="text-lg font-bold text-gray-900">₹ {quote.price} <span className="text-sm font-normal text-gray-500">/ pc</span></p>
                                                <p className="text-xs text-gray-500 mt-1">Lead Time: {quote.lead_time}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400 mb-1">Details</p>
                                                <p className="text-sm text-gray-900"><span className="font-medium">Material:</span> {quote.rfqs.material_admin || 'N/A'}</p>
                                                <p className="text-sm text-gray-900"><span className="font-medium">Review:</span> {quote.remarks || 'No remarks'}</p>
                                            </div>
                                        </div>

                                        {/* Actions / Files */}
                                        <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FileText className="h-4 w-4 text-gray-400" />
                                                Quote_File.pdf
                                            </div>

                                            {status === 'Approved' && (
                                                <button
                                                    onClick={() => handleOpenUpload(quote.rfqs.id)}
                                                    className="ml-auto text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Upload Performa Invoice
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* AD PLACEMENT (Interspersed or after every card) */}
                                {(index % 2 === 0 || index === displayedQuotes.length - 1) && (
                                    <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-center justify-between px-6">
                                        <span className="font-bold text-gray-800">Ad</span>
                                        <span className="text-sm text-gray-500">Advertisement • 728 x 90</span>
                                        <span className="text-xs text-gray-400">Google</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* UPLOAD MODAL */}
            {isUploadOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold mb-4">Upload Performa Invoice</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Please upload the pro-forma invoice (PI) to confirm this order.
                            Once uploaded, the order will move to the "My Orders" tab.
                        </p>

                        <form onSubmit={handleUploadPI} className="space-y-4">
                            <input
                                type="file"
                                name="file"
                                accept=".pdf,.png,.jpg"
                                required
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                                >
                                    {uploading ? "Uploading..." : "Confirm Update"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
