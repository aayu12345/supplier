"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNav() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === "/dashboard/buyer" && pathname === "/dashboard/buyer") return true;
        if (path !== "/dashboard/buyer" && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="flex gap-6 border-b border-gray-100 mb-6">
            <Link
                href="/dashboard/buyer"
                className={`pb-3 font-medium transition-colors ${isActive("/dashboard/buyer")
                    ? "text-blue-600 border-b-2 border-blue-600 font-bold"
                    : "text-gray-500 hover:text-gray-900"
                    }`}
            >
                My RFQs
            </Link>
            <Link
                href="/dashboard/buyer/orders"
                className={`pb-3 font-medium transition-colors ${isActive("/dashboard/buyer/orders")
                    ? "text-blue-600 border-b-2 border-blue-600 font-bold"
                    : "text-gray-500 hover:text-gray-900"
                    }`}
            >
                My Orders
            </Link>
            <Link
                href="/dashboard/buyer/payments"
                className={`pb-3 font-medium transition-colors ${isActive("/dashboard/buyer/payments")
                    ? "text-blue-600 border-b-2 border-blue-600 font-bold"
                    : "text-gray-500 hover:text-gray-900"
                    }`}
            >
                Payments
            </Link>
        </div>
    );
}
