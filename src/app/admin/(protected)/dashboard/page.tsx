"use client";

import Link from "next/link";
import { Users, ShoppingBag } from "lucide-react";

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Buyer Section */}
                <Link href="/admin/buyers" className="block group">
                    <div className="p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-500 hover:ring-2 hover:ring-blue-200 transition-all cursor-pointer h-full">
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Users className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Buyer Management</h2>
                        <p className="text-gray-500">
                            Manage buyers, view RFQs, track orders, and handle payments.
                        </p>
                        <div className="mt-6 text-blue-600 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                            Go to Buyers &rarr;
                        </div>
                    </div>
                </Link>

                {/* Supplier Management Section */}
                <Link href="/admin/suppliers" className="block group">
                    <div className="p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-green-500 hover:ring-2 hover:ring-green-200 transition-all cursor-pointer h-full">
                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Supplier Panel</h2>
                        <p className="text-gray-500">
                            Manage suppliers, view trust scores, track activity, and monitor quotes.
                        </p>
                        <div className="mt-6 text-green-600 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                            Go to Suppliers &rarr;
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
