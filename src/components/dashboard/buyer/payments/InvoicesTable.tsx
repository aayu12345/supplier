"use client";

import { Download, Eye, Search, Filter } from "lucide-react";
import { useState } from "react";

export type Invoice = {
    id: string;
    invoice_number: string;
    items?: any; // JSONB
    amount: number;
    status: "Paid" | "Pending" | "Overdue" | "Partially Paid";
    issued_date: string;
    due_date: string;
    rfq_number?: string; // Loaded via join
    pdf_url?: string;
    credit_terms?: string; // e.g. "Net 30"
};

export default function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inv.rfq_number && inv.rfq_number.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Paid": return "bg-green-100 text-green-700";
            case "Pending": return "bg-yellow-100 text-yellow-700";
            case "Overdue": return "bg-red-100 text-red-700";
            case "Partially Paid": return "bg-orange-100 text-orange-700";
            default: return "bg-gray-100 text-gray-600";
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header Controls */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Invoices</h3>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search invoice..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative flex-1 md:w-48">
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-500"
                        />
                    </div>
                    <select
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-3">Invoice</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Terms</th>
                            <th className="px-6 py-3">RFQ #</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredInvoices.length > 0 ? (
                            filteredInvoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">{inv.invoice_number}</td>
                                    <td className="px-6 py-4 text-gray-600">{new Date(inv.issued_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{inv.credit_terms || "Net 30"}</td>
                                    <td className="px-6 py-4 text-gray-600">{inv.rfq_number || '—'}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(inv.amount)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${getStatusColor(inv.status)}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {inv.status === "Paid" ? (
                                                <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-xs font-medium bg-gray-50 px-2 py-1.5 rounded border border-gray-200">
                                                    <Download className="h-3 w-3" /> Download
                                                </button>
                                            ) : (
                                                <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium bg-blue-50 px-2 py-1.5 rounded border border-blue-100">
                                                    <Eye className="h-3 w-3" /> View
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                    No invoices found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
