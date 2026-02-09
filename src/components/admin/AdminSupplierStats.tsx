"use client";

import { Users, Activity, Clock, ShieldCheck, Timer, FileText } from "lucide-react";

type Stats = {
    totalSuppliers: number;
    activeSuppliers: number;
    idleSuppliers: number;
    avgTrustScore: string;
    avgQuoteTime: string;
    quotesThisWeek: number;
};

export default function AdminSupplierStats({ stats }: { stats: Stats }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard
                icon={Users}
                label="Total Suppliers"
                value={stats.totalSuppliers}
                color="bg-blue-500"
            />
            <StatCard
                icon={Activity}
                label="Active (7 Days)"
                value={stats.activeSuppliers}
                color="bg-green-500"
                subtext="Quotes Submitted"
            />
            <StatCard
                icon={Clock}
                label="Idle (>30 Days)"
                value={stats.idleSuppliers}
                color="bg-orange-500"
                subtext="No Quotes"
            />
            <StatCard
                icon={ShieldCheck}
                label="Avg Trust Score"
                value={stats.avgTrustScore}
                color="bg-purple-500"
                isScore
            />
            <StatCard
                icon={Timer}
                label="Avg Quote Time"
                value={stats.avgQuoteTime}
                color="bg-indigo-500"
            />
            <StatCard
                icon={FileText}
                label="Quotes This Week"
                value={stats.quotesThisWeek}
                color="bg-pink-500"
            />
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, subtext, isScore }: any) {
    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
                    <Icon className={`h-4 w-4 ${color.replace("bg-", "text-")}`} />
                </div>
                <span className="text-xs font-semibold text-gray-500 truncate">{label}</span>
            </div>
            <div>
                <h3 className={`text-2xl font-bold text-gray-900 ${isScore ? 'text-purple-600' : ''}`}>
                    {value}
                </h3>
                {subtext && <p className="text-[10px] text-gray-400 mt-1">{subtext}</p>}
            </div>
        </div>
    );
}
