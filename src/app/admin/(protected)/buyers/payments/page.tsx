"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle, Clock, DollarSign, FileText } from "lucide-react";
import Link from "next/link";

type PaymentRecord = {
    id: string;
    total_amount: number;
    currency: string;

    advance_amount: number;
    advance_percentage: number;
    advance_status: string;
    advance_due_date: string;

    balance_amount: number;
    balance_status: string;
    balance_due_date: string;

    payment_status: string;

    orders: {
        order_number: string;
        rfqs: { rfq_number: string };
        profiles: { name: string; company_name: string };
    };
};

export default function PaymentsDashboardPage() {
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"advance" | "balance" | "completed">("advance");
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
                        rfqs ( rfq_number ),
                        profiles ( name, company_name )
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
                                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                            Manage
                                        </button>
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
