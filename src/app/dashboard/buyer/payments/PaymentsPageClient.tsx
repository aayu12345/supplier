"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/buyer/DashboardHeader";
import DashboardNav from "@/components/dashboard/buyer/DashboardNav"; // Persistent Nav
import BillingOverview, { Financials } from "@/components/dashboard/buyer/payments/BillingOverview";
import InvoicesTable, { Invoice } from "@/components/dashboard/buyer/payments/InvoicesTable";
import PaymentHistory, { Payment } from "@/components/dashboard/buyer/payments/PaymentHistory";
import RFQUploadModal from "@/components/dashboard/buyer/RFQUploadModal";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function PaymentsPageClient({
    userName,
    isLoggedIn,
    financials,
    invoices,
    payments
}: {
    userName: string,
    isLoggedIn: boolean,
    financials: Financials,
    invoices: Invoice[],
    payments: Payment[]
}) {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 block bg-white p-4 md:px-8 md:pt-8 md:pb-0 rounded-xl shadow-sm border border-gray-200">
                    <DashboardHeader userName={userName} onUploadClick={() => setIsUploadModalOpen(true)} isLoggedIn={isLoggedIn} />
                    <DashboardNav />
                </div>

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Billing & Payments</h2>
                        <p className="text-gray-500 text-sm mt-1">Manage invoices, payments, and credit details.</p>
                    </div>
                    <a href="mailto:finance@thesupplier.in?subject=Dispute%20Resolution" className="hidden md:flex items-center gap-2 text-red-600 hover:text-red-700 font-medium px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                        <Mail className="h-4 w-4" /> Raise Dispute
                    </a>
                </div>

                {/* Overdue Alert Bar */}
                {invoices.some(inv => inv.status === 'Overdue') && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                        <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                            <span className="font-bold text-lg">!</span>
                        </div>
                        <div>
                            <h4 className="text-red-800 font-bold">Action Required: Overdue Invoices</h4>
                            <p className="text-red-600 text-sm">You have outstanding invoices that are past their due date. Please clear them to avoid service interruption.</p>
                        </div>
                    </div>
                )}

                {/* Billing Overview Cards */}
                <BillingOverview financials={financials} />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Invoices Table */}
                    <div className="lg:col-span-2">
                        <InvoicesTable invoices={invoices} />
                    </div>

                    {/* Right: Payment History */}
                    <div className="lg:col-span-1">
                        <PaymentHistory payments={payments} />
                    </div>
                </div>
            </div>

            <RFQUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} isLoggedIn={isLoggedIn} />
        </div>
    );
}
