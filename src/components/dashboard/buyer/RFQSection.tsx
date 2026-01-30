"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function RFQSection() {
    const rfqs = [
        {
            id: "RFQ-2024-001",
            status: "Live",
            lastActivity: "Awaiting Quotes",
            created: "2024-01-20",
        },
        {
            id: "RFQ-2024-003",
            status: "Live",
            lastActivity: "Awaiting Quotes",
            created: "2024-01-15",
        },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Inner Tabs */}
            <div className="flex border-b border-gray-100">
                <button className="px-6 py-4 text-blue-600 font-bold border-b-2 border-blue-600 text-sm">
                    Pending Quotes
                </button>
                <button className="px-6 py-4 text-gray-500 font-medium hover:text-gray-700 text-sm">
                    Received Quotes
                </button>
                <button className="px-6 py-4 text-gray-500 font-medium hover:text-gray-700 text-sm">
                    Negotiation
                </button>
                <div className="flex-1 flex justify-end items-center pr-4">
                    <Link
                        href="/dashboard/buyer/quotes"
                        className="text-gray-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
                    >
                        View All <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            {/* Sub Filter */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-2">
                <button className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-md text-xs font-bold border border-blue-100">
                    Pending Quotes
                </button>
                <button className="px-4 py-1.5 bg-white text-gray-600 rounded-md text-xs font-medium border border-gray-200 hover:bg-gray-50">
                    Received Quotes
                </button>
                <button className="px-4 py-1.5 bg-white text-gray-600 rounded-md text-xs font-medium border border-gray-200 hover:bg-gray-50">
                    Negotiation
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">RFQ Number</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Last Activity</th>
                            <th className="px-6 py-4">Created</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rfqs.map((rfq) => (
                            <tr key={rfq.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                                <td className="px-6 py-4 font-medium text-gray-900">{rfq.id}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold">
                                        {rfq.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{rfq.lastActivity}</td>
                                <td className="px-6 py-4 text-gray-500">{rfq.created}</td>
                                <td className="px-6 py-4 text-right">
                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors inline-block" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                <Link
                    href="/dashboard/buyer/quotes"
                    className="text-gray-500 hover:text-blue-600 text-sm font-medium inline-flex items-center gap-1"
                >
                    View All <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}
