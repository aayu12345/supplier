"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Download, Upload, Star, CheckCircle, XCircle, Clock, FileText, AlertTriangle, Mail, Phone } from "lucide-react";
import Link from "next/link";

type Invoice = {
    id: string;
    order_id: string;
    invoice_number: string;
    invoice_date: string;
    amount: number;
    status: string;
    invoice_url: string;
    orders: {
        order_number: string;
    };
};

export default function PaymentsBillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAdvanceModal, setShowAdvanceModal] = useState(false);
    const [showDisputeModal, setShowDisputeModal] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch invoices
        const { data: invoicesData } = await supabase
            .from("supplier_invoices")
            .select(`
                *,
                orders (
                    order_number
                )
            `)
            .eq("supplier_id", user.id)
            .order("invoice_date", { ascending: false });

        setInvoices(invoicesData as any || []);

        // Fetch supplier metrics
        const { data: metricsData } = await supabase
            .from("supplier_metrics")
            .select("*")
            .eq("id", user.id)
            .single();

        setMetrics(metricsData);
        setLoading(false);
    };

    // Calculate financial summary
    const totalInvoices = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const amountPaid = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
    const balancePending = totalInvoices - amountPaid;
    const lastPaymentDate = invoices.find(inv => inv.status === 'Paid')?.invoice_date;

    // Check advance eligibility
    const trustScore = metrics?.trust_score || 0;
    const completedOrders = metrics?.orders_completed_count || 0;
    const isEligibleForAdvance = trustScore >= 4.5 && completedOrders >= 3;

    const getStatusBadge = (status: string) => {
        const styles = {
            Paid: "bg-green-100 text-green-700 border-green-200",
            Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
            Disputed: "bg-red-100 text-red-700 border-red-200",
        };
        return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700";
    };

    const getStatusIcon = (status: string) => {
        if (status === "Paid") return <CheckCircle className="h-4 w-4" />;
        if (status === "Disputed") return <AlertTriangle className="h-4 w-4" />;
        return <Clock className="h-4 w-4" />;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Payment & Billing</h1>
                    <p className="text-gray-500 mt-1">Manage your invoices, payments, and financial documents</p>
                </div>

                {/* Top Section: Overview + Trust Score */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                    {/* Left: Overview Box */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Overview</h2>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Invoices Raised</p>
                                <p className="text-3xl font-bold text-gray-900">₹ {totalInvoices.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
                                <p className="text-3xl font-bold text-green-600">₹ {amountPaid.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Balance Pending</p>
                                <p className="text-3xl font-bold text-orange-600">₹ {balancePending.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Payment Terms</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics?.payment_terms_days || 45} Days</p>
                                <p className="text-xs text-gray-400">from PO</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <p className="text-sm text-gray-500">Last Payment Date</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {lastPaymentDate ? new Date(lastPaymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No payments yet'}
                            </p>
                        </div>
                    </div>

                    {/* Right: Trust Score & Advance Eligibility */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Trust Score</h3>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-5xl font-extrabold text-blue-600">{trustScore.toFixed(1)}</span>
                                <span className="text-2xl text-gray-400">/5</span>
                            </div>
                            <div className="flex justify-center gap-1 mt-2">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className={`h-5 w-5 ${i <= Math.round(trustScore) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Eligible for Advance Support?</h4>
                            <div className="flex items-center gap-2 mb-3">
                                {isEligibleForAdvance ? (
                                    <>
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="font-bold text-green-600">Yes</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-5 w-5 text-red-600" />
                                        <span className="font-bold text-red-600">No</span>
                                    </>
                                )}
                            </div>

                            <div className="space-y-2 text-sm">
                                <p className="font-medium text-gray-700">Advance Criteria:</p>
                                <ul className="space-y-1 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <span className={trustScore >= 4.5 ? 'text-green-600' : 'text-gray-400'}>•</span>
                                        <span>Trust Score ≥4.5</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className={completedOrders >= 3 ? 'text-green-600' : 'text-gray-400'}>•</span>
                                        <span>3+ completed orders</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-gray-400">•</span>
                                        <span>No major QC issues or missed delivery dates</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowAdvanceModal(true)}
                            disabled={!isEligibleForAdvance}
                            className={`w-full py-3 rounded-lg font-semibold transition-colors ${isEligibleForAdvance
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            Request Advance Support
                        </button>
                    </div>
                </div>

                {/* Transaction History Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900">Transaction History</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Download</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
                                ) : invoices.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No invoices found</td></tr>
                                ) : (
                                    invoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {invoice.orders?.order_number || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.invoice_number}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(invoice.invoice_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                ₹{invoice.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${getStatusBadge(invoice.status)}`}>
                                                    {getStatusIcon(invoice.status)}
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {invoice.invoice_url ? (
                                                    <a href={invoice.invoice_url} target="_blank" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                                        <Download className="h-4 w-4" />
                                                        PDF
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Documents & Support Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                    {/* Left: Documents */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-400" />
                            Documents
                        </h3>
                        <div className="space-y-3">
                            <Link href="#" className="flex items-center gap-3 text-blue-600 hover:text-blue-800 font-medium">
                                <Upload className="h-4 w-4" />
                                Upload Signed Invoice
                            </Link>
                            <Link href="#" className="flex items-center gap-3 text-blue-600 hover:text-blue-800 font-medium">
                                <Upload className="h-4 w-4" />
                                Upload Transport Receipt
                            </Link>
                            <hr className="my-4" />
                            <Link href="#" className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                                <Download className="h-4 w-4" />
                                Purchase Order (PO)
                            </Link>
                            <Link href="#" className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                                <Download className="h-4 w-4" />
                                Proforma Invoice
                            </Link>
                            <Link href="#" className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                                <Download className="h-4 w-4" />
                                Final Invoice
                            </Link>
                            <Link href="#" className="flex items-center gap-3 text-gray-700 hover:text-gray-900">
                                <Download className="h-4 w-4" />
                                Transport Receipt
                            </Link>
                        </div>
                    </div>

                    {/* Right: Support */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Support</h3>
                        <div className="space-y-4">
                            <button
                                onClick={() => setShowDisputeModal(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium transition-colors"
                            >
                                <AlertTriangle className="h-5 w-5" />
                                Raise a Payment Dispute
                            </button>
                            <Link
                                href="mailto:finance@thesupplier.com"
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                            >
                                <Mail className="h-5 w-5" />
                                Contact Finance Team
                            </Link>
                            <Link
                                href="tel:+911234567890"
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium transition-colors"
                            >
                                <Phone className="h-5 w-5" />
                                Call Support
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Ad Banner */}
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-xs bg-white px-2 py-0.5 rounded text-gray-500 font-semibold">Ad</span>
                        <div>
                            <p className="font-bold text-gray-900">Advertisement Space</p>
                            <p className="text-sm text-gray-600">Google AdSense • 728 x 90</p>
                        </div>
                    </div>
                    <span className="text-xs text-gray-400">Google</span>
                </div>

            </div>

            {/* Modals would go here - simplified for now */}
            {showAdvanceModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Request Advance Support</h3>
                        <p className="text-gray-600 mb-4">Feature coming soon...</p>
                        <button onClick={() => setShowAdvanceModal(false)} className="btn-primary w-full">Close</button>
                    </div>
                </div>
            )}

            {showDisputeModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Raise Payment Dispute</h3>
                        <p className="text-gray-600 mb-4">Feature coming soon...</p>
                        <button onClick={() => setShowDisputeModal(false)} className="btn-primary w-full">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
