"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/buyer/DashboardHeader";
import DashboardNav from "@/components/dashboard/buyer/DashboardNav";
import OrdersTable from "@/components/dashboard/buyer/orders/OrdersTable";
import RFQUploadModal from "@/components/dashboard/buyer/RFQUploadModal";
import Link from "next/link"; // Changed import source if needed

export default function OrdersPageClient({ userName, isLoggedIn }: { userName: string, isLoggedIn: boolean }) {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    return (
        <>
            <div className="mb-8">
                <DashboardHeader
                    userName={userName}
                    onUploadClick={() => setIsUploadModalOpen(true)}
                    isLoggedIn={isLoggedIn}
                />

                {/* Persistent Navigation */}
                <DashboardNav />
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
                <p className="text-gray-500 text-sm">Track your running orders and view history.</p>
            </div>

            <OrdersTable />

            <RFQUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                isLoggedIn={isLoggedIn}
            />
        </>
    );
}
