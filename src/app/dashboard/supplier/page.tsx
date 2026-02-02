import { Factory, Search, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function SupplierDashboard() {
    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Supplier Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage quotes, orders, and track your performance.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                        View Profile
                    </button>
                    <Link href="/dashboard/supplier/marketplace" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 shadow-sm shadow-green-200">
                        <Search className="h-4 w-4" />
                        Find New RFQs
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Quotes</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">12</h3>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">4</h3>
                        </div>
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                            <Factory className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Action Required</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">2</h3>
                        </div>
                        <div className="p-2 bg-red-50 rounded-lg text-red-600">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Empty State / Call to Action */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">Start Quoting Today!</h2>
                    <p className="text-gray-600 text-lg leading-relaxed">
                        There are <span className="font-bold text-green-700">45+ new RFQs</span> matching your capabilities.
                        Submit competitive quotes to win consistent business from verified buyers.
                    </p>
                    <Link href="/dashboard/supplier/marketplace" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-lg shadow-green-200">
                        Explore Marketplace <Search className="h-5 w-5" />
                    </Link>
                </div>

            </div>

        </div>
    );
}
