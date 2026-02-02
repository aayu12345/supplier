import Link from "next/link";
import { Users, Factory } from "lucide-react";

export default function AdminDashboardPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-500 mb-12">Select a module to manage</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Buyer Card */}
                <Link href="/admin/buyers" className="group">
                    <div className="bg-white p-10 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col items-center text-center cursor-pointer group-hover:border-blue-500/30">
                        <div className="bg-blue-50 p-6 rounded-full mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                            <Users className="h-12 w-12 text-blue-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Buyer Management</h2>
                        <p className="text-gray-500 leading-relaxed">
                            View registered buyers, manage their RFQs, track orders, and oversee financial details.
                        </p>
                    </div>
                </Link>

                {/* Supplier Card */}
                <Link href="/admin/suppliers" className="group">
                    <div className="bg-white p-10 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col items-center text-center cursor-pointer group-hover:border-emerald-500/30">
                        <div className="bg-emerald-50 p-6 rounded-full mb-6 group-hover:bg-emerald-600 transition-colors duration-300">
                            <Factory className="h-12 w-12 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Supplier Management</h2>
                        <p className="text-gray-500 leading-relaxed">
                            Onboard new suppliers, verify credentials, manage catalogs, and monitor performance.
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
