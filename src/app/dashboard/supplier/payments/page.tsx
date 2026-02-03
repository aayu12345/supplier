"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CreditCard, Download, Clock, CheckCircle, AlertCircle } from "lucide-react";

type Payment = {
    id: string;
    order_id: string;
    amount: number;
    status: string;
    payment_date: string;
    invoice_url?: string;
    orders: {
        order_number: string;
    } | null;
};

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("order_payments")
                .select(`
                    id,
                    order_id,
                    amount,
                    status,
                    payment_date,
                    invoice_url,
                    orders:order_id (
                        order_number
                    )
                `)
                .order("payment_date", { ascending: false });

            if (error) throw error;
            setPayments(data as any);
        } catch (err) {
            console.error("Error fetching payments:", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            Paid: "bg-green-100 text-green-700 border-green-200",
            Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
            Failed: "bg-red-100 text-red-700 border-red-200",
        };
        return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700";
    };

    const getStatusIcon = (status: string) => {
        if (status === "Paid") return <CheckCircle className="h-4 w-4" />;
        if (status === "Failed") return <AlertCircle className="h-4 w-4" />;
        return <Clock className="h-4 w-4" />;
    };

    const totalEarnings = payments
        .filter((p) => p.status === "Paid")
        .reduce((sum, p) => sum + p.amount, 0);

    const pendingPayments = payments
        .filter((p) => p.status === "Pending")
        .reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
                    <p className="text-gray-500">Track your invoices and payment history</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">₹{totalEarnings.toLocaleString()}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                                <Clock className="h-5 w-5" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-500">Pending Payments</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">₹{pendingPayments.toLocaleString()}</p>
                    </div>
                </div>

                {/* Payment History */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
                                ))}
                            </div>
                        ) : payments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <CreditCard className="h-12 w-12 text-gray-300 mb-3" />
                                <p>No payment records found.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {payments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-bold text-gray-900">
                                                    {payment.orders?.order_number || "N/A"}
                                                </h4>
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusBadge(
                                                        payment.status
                                                    )}`}
                                                >
                                                    {getStatusIcon(payment.status)}
                                                    {payment.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {new Date(payment.payment_date).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <p className="text-lg font-bold text-gray-900">
                                                ₹{payment.amount.toLocaleString()}
                                            </p>
                                            {payment.invoice_url && (
                                                <a
                                                    href={payment.invoice_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Download Invoice"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            )}
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
