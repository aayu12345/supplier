"use client";

import { useState } from "react";
import DashboardHeader from "@/components/dashboard/buyer/DashboardHeader";
import HeroBanner from "@/components/dashboard/buyer/HeroBanner";
import QuotesTable from "@/components/dashboard/buyer/quotes/QuotesTable";
import RecentActivity from "@/components/dashboard/buyer/RecentActivity";
import RFQUploadModal from "@/components/dashboard/buyer/RFQUploadModal";

interface BuyerDashboardClientProps {
    userName: string;
    isLoggedIn: boolean;
    shouldOpenModal?: boolean;
}

export default function BuyerDashboardClient({ userName, isLoggedIn, shouldOpenModal = false }: BuyerDashboardClientProps) {
    const [isModalOpen, setIsModalOpen] = useState(shouldOpenModal);

    return (
        <div className="min-h-screen bg-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Pass onUploadClick to Header */}
                <div className="mb-8 block">
                    <HeaderWrapper userName={userName} onUploadClick={() => setIsModalOpen(true)} isLoggedIn={isLoggedIn} />
                </div>

                {/* HeroBanner Removed as per user request */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Your Quotes</h2>
                        </div>
                        {/* We use QuotesTable directly as it has built-in tabs and data fetching */}
                        <QuotesTable />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <RecentActivity />
                    </div>
                </div>
            </div>

            <RFQUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isLoggedIn={isLoggedIn} />
        </div>
    );
}

// Temporary Wrappers to inject props into Server Components if they stay Server Components
// But actually, Header and Hero are simple display components. 
// I will modify them to accept the onClick prop, forcing them to be client-compatible or just simple functions.
// Let's modify Header and Hero files to accept props.

// ...Wait, I can't modify the import behavior in this file easily if I don't modify the source files.
// For now, I will assume I modify DashboardHeader and HeroBanner to accept `onUploadClick`.
// See next steps. 

function HeaderWrapper({ userName, onUploadClick, isLoggedIn }: { userName: string, onUploadClick: () => void, isLoggedIn: boolean }) {
    // This is a workaround to pass the prop if I haven't modified the component yet.
    // But I WILL modify the component in the next tool call.
    return (
        <DashboardHeader userName={userName} onUploadClick={onUploadClick} isLoggedIn={isLoggedIn} />
    )
}

function HeroWrapper({ onUploadClick }: { onUploadClick: () => void }) {
    return (
        <HeroBanner onUploadClick={onUploadClick} />
    )
}
