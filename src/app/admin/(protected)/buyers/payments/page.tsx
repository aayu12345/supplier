"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle, Clock, DollarSign, FileText, X, Save } from "lucide-react";
import Link from "next/link";

type PaymentRecord = {
    id: string;
    total_amount: number;
    currency: string;

    advance_amount: number;
    advance_percentage: number;
    advance_status: string;
    advance_due_date: string;
    advance_paid_date?: string;
    advance_doc_url?: string;

    balance_amount: number;
    balance_status: string;
    balance_due_date: string;
    balance_paid_date?: string;
    balance_doc_url?: string;

    payment_status: string;

    orders: {
        order_number: string;
        rfqs: { rfq_number: string };
        profiles: { name: string; company_name: string };
    };
    created_at: string;
};

export default function PaymentsDashboardPage() {
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"advance" | "balance" | "completed">("advance");
    const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("order_payments")
                .select(`
                    *,
                    orders (
                        order_number,
                        rfqs:rfq_id ( rfq_number ),
                        profiles:buyer_id ( name, company_name )
                    )
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setPayments(data as any);
        } catch (error) {
            console.error("Error fetching payments:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const advancePending = payments.filter(p => p.advance_status !== 'Paid');
    const balancePending = payments.filter(p => p.advance_status === 'Paid' && p.balance_status !== 'Paid');
    const completed = payments.filter(p => p.payment_status === 'Fully Paid');

    const currentList = activeTab === 'advance' ? advancePending
        : activeTab === 'balance' ? balancePending
            : completed;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    onClick={() => setActiveTab("advance")}
                    className={`cursor-pointer p-6 rounded-xl border transition-all ${activeTab === 'advance' ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-100' : 'bg-white border-gray-200 hover:shadow-sm'}`}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <h3 className="font-semibold text-gray-900">Advance Pending</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{advancePending.length} <span className="text-sm font-normal text-gray-500">Orders</span></p>
                </div>

                <div
                    onClick={() => setActiveTab("balance")}
                    className={`cursor-pointer p-6 rounded-xl border transition-all ${activeTab === 'balance' ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-white border-gray-200 hover:shadow-sm'}`}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold text-gray-900">Balance Pending</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{balancePending.length} <span className="text-sm font-normal text-gray-500">Orders</span></p>
                </div>

                <div
                    onClick={() => setActiveTab("completed")}
                    className={`cursor-pointer p-6 rounded-xl border transition-all ${activeTab === 'completed' ? 'bg-green-50 border-green-200 ring-2 ring-green-100' : 'bg-white border-gray-200 hover:shadow-sm'}`}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h3 className="font-semibold text-gray-900">Fully Paid</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{completed.length} <span className="text-sm font-normal text-gray-500">Orders</span></p>
                </div>
            </div>

            {/* List */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">
                        {activeTab === 'advance' ? 'Waiting for Advance Payment'
                            : activeTab === 'balance' ? 'Production Done - Balance Due'
                                : 'Completed Payment History'}
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading payments...</div>
                ) : currentList.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No records found in this category.</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Order / Buyer</th>
                                <th className="px-6 py-4 font-semibold">Total Value</th>
                                <th className="px-6 py-4 font-semibold">
                                    {activeTab === 'advance' ? 'Advance Due' : activeTab === 'balance' ? 'Balance Due' : 'Paid Amount'}
                                </th>
                                <th className="px-6 py-4 font-semibold">Due Date</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentList.map((pay) => (
                                <tr key={pay.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">{pay.orders?.order_number || "N/A"}</p>
                                        <p className="text-sm text-gray-500">{pay.orders?.profiles?.company_name || "Unknown Company"}</p>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {pay.currency} {pay.total_amount?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-800">
                                        {activeTab === 'advance' ? (
                                            <div>
                                                <span className="font-bold">{pay.currency} {pay.advance_amount?.toLocaleString()}</span>
                                                <span className="text-xs text-gray-500 ml-1">({pay.advance_percentage}%)</span>
                                            </div>
                                        ) : activeTab === 'balance' ? (
                                            <div>
                                                <span className="font-bold">{pay.currency} {pay.balance_amount?.toLocaleString()}</span>
                                                <span className="text-xs text-gray-500 ml-1">({100 - pay.advance_percentage}%)</span>
                                            </div>
                                        ) : (
                                            <span className="text-green-600 font-bold">Full Paid</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {activeTab === 'advance'
                                            ? (pay.advance_due_date ? new Date(pay.advance_due_date).toLocaleDateString() : '-')
                                            : (pay.balance_due_date ? new Date(pay.balance_due_date).toLocaleDateString() : '-')
                                        }
                                    </td>
                                    <td className="px-6 py-4">
                                        {activeTab === 'advance' && (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${pay.advance_status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {pay.advance_status}
                                            </span>
                                        )}
                                        {activeTab === 'balance' && (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${pay.balance_status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {pay.balance_status}
                                            </span>
                                        )}
                                        {activeTab === 'completed' && (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                Paid
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedPayment(pay)}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                        >
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Manage Payment Modal */}
            {selectedPayment && (
                <ManagePaymentModal
                    payment={selectedPayment}
                    onClose={() => setSelectedPayment(null)}
                    onSuccess={() => {
                        setSelectedPayment(null);
                        fetchPayments();
                    }}
                />
            )}
        </div>
    );
}

function ManagePaymentModal({ payment, onClose, onSuccess }: { payment: PaymentRecord, onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    // Form State
    const [advPercent, setAdvPercent] = useState(payment.advance_percentage);

    // Advance Status
    const [advStatus, setAdvStatus] = useState(payment.advance_status);
    const [advDate, setAdvDate] = useState(payment.advance_paid_date || "");
    const [advFile, setAdvFile] = useState<File | null>(null);
    const [showAdvUpload, setShowAdvUpload] = useState(!payment.advance_doc_url);

    // Balance Status
    const [balStatus, setBalStatus] = useState(payment.balance_status);
    const [balDate, setBalDate] = useState(payment.balance_paid_date || "");
    const [balFile, setBalFile] = useState<File | null>(null);
    const [showBalUpload, setShowBalUpload] = useState(!payment.balance_doc_url);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let advDocUrl = payment.advance_doc_url;
            let balDocUrl = payment.balance_doc_url;

            // 1. Upload Files if new ones selected
            if (advFile) {
                const path = `payments/${payment.id}/advance_${Date.now()}_${advFile.name}`;
                const { error } = await supabase.storage.from('rfq-drawings').upload(path, advFile);
                if (error) throw error;
                const { data } = supabase.storage.from('rfq-drawings').getPublicUrl(path);
                advDocUrl = data.publicUrl;
            }

            if (balFile) {
                const path = `payments/${payment.id}/balance_${Date.now()}_${balFile.name}`;
                const { error } = await supabase.storage.from('rfq-drawings').upload(path, balFile);
                if (error) throw error;
                const { data } = supabase.storage.from('rfq-drawings').getPublicUrl(path);
                balDocUrl = data.publicUrl;
            }

            // 2. Update Database
            const { error } = await supabase
                .from("order_payments")
                .update({
                    advance_percentage: advPercent,
                    advance_status: advStatus,
                    advance_paid_date: advDate || null,
                    advance_doc_url: advDocUrl,

                    balance_status: balStatus,
                    balance_paid_date: balDate || null,
                    balance_doc_url: balDocUrl,

                    updated_at: new Date().toISOString()
                })
                .eq("id", payment.id);

            if (error) throw error;

            alert("Payment Updated Successfully!");
            onSuccess();

        } catch (error: any) {
            console.error("Update Error:", error);
            alert("Failed to update payment: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">Manage Payment</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">

                    {/* 1. Advance Configuration */}
                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-orange-900 flex items-center gap-2">
                                <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-xs">1</span>
                                Advance Payment
                            </h3>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-orange-800">Split %:</label>
                                <input
                                    type="number"
                                    value={advPercent}
                                    onChange={(e) => setAdvPercent(Number(e.target.value))}
                                    className="w-16 px-2 py-1 border border-orange-300 rounded text-center font-bold"
                                    min="0" max="100"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Status</label>
                                <select
                                    value={advStatus}
                                    onChange={(e) => setAdvStatus(e.target.value)}
                                    className="w-full p-2 border border-orange-200 rounded-lg bg-white"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Overdue">Overdue</option>
                                    <option value="Paid">Paid</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Payment Date</label>
                                <input
                                    type="date"
                                    value={advDate}
                                    onChange={(e) => setAdvDate(e.target.value)}
                                    className="w-full p-2 border border-orange-200 rounded-lg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Proof (UTR / Advice)</label>
                            {!showAdvUpload && payment.advance_doc_url ? (
                                <div className="flex items-center justify-between bg-white p-2 border border-orange-200 rounded-lg">
                                    <a href={payment.advance_doc_url} target="_blank" className="text-blue-600 hover:underline text-sm truncate">View Uploaded File</a>
                                    <button type="button" onClick={() => setShowAdvUpload(true)} className="text-xs text-red-500 hover:underline">Replace</button>
                                </div>
                            ) : (
                                <input
                                    type="file"
                                    onChange={(e) => setAdvFile(e.target.files?.[0] || null)}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
                                />
                            )}
                        </div>
                    </div>

                    {/* 2. Balance Configuration */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-blue-900 flex items-center gap-2">
                                <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">2</span>
                                Balance Payment
                            </h3>
                            <div className="text-sm font-medium text-blue-800">
                                Remaining: <span className="font-bold">{100 - advPercent}%</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Status</label>
                                <select
                                    value={balStatus}
                                    onChange={(e) => setBalStatus(e.target.value)}
                                    className="w-full p-2 border border-blue-200 rounded-lg bg-white"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Overdue">Overdue</option>
                                    <option value="Paid">Paid</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Payment Date</label>
                                <input
                                    type="date"
                                    value={balDate}
                                    onChange={(e) => setBalDate(e.target.value)}
                                    className="w-full p-2 border border-blue-200 rounded-lg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Proof (UTR / Advice)</label>
                            {!showBalUpload && payment.balance_doc_url ? (
                                <div className="flex items-center justify-between bg-white p-2 border border-blue-200 rounded-lg">
                                    <a href={payment.balance_doc_url} target="_blank" className="text-blue-600 hover:underline text-sm truncate">View Uploaded File</a>
                                    <button type="button" onClick={() => setShowBalUpload(true)} className="text-xs text-red-500 hover:underline">Replace</button>
                                </div>
                            ) : (
                                <input
                                    type="file"
                                    onChange={(e) => setBalFile(e.target.files?.[0] || null)}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                />
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg disabled:opacity-50 flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
