"use client";

import clsx from "clsx";

const tabs = ["MY RFQs", "MY ORDERS", "MY PAYMENTS", "COMPLETED ORDERS"];

export default function DashboardTabs() {
    const activeTab = "MY RFQs"; // Static for now

    return (
        <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    className={clsx(
                        "px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-sm",
                        tab === activeTab
                            ? "bg-blue-600 text-white shadow-blue-200"
                            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
                    )}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
}
