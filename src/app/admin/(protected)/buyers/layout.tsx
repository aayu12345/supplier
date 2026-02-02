"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BUYER_NAVS = [
    { name: "RFQs", href: "/admin/buyers/rfqs" },
    { name: "Orders", href: "/admin/buyers/orders" },
    { name: "Payments", href: "/admin/buyers/payments" },
    { name: "All Buyers", href: "/admin/buyers/list" },
];

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full">
            {/* Buyer Sub-Navigation */}
            <div className="bg-white border-b border-gray-200 px-8 py-4">
                <div className="flex items-center gap-1 mb-4 text-sm text-gray-500">
                    <Link href="/admin/dashboard" className="hover:text-blue-600">Dashboard</Link>
                    <span>/</span>
                    <span className="font-semibold text-gray-900">Buyer Management</span>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-6">Buyer Management</h1>

                <div className="flex space-x-1">
                    {BUYER_NAVS.map((nav) => {
                        // Check if current path starts with the nav href (for active state)
                        const isActive = pathname.startsWith(nav.href);
                        return (
                            <Link
                                key={nav.name}
                                href={nav.href}
                                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${isActive
                                        ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                {nav.name}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-gray-50 p-8">
                {children}
            </div>
        </div>
    );
}
