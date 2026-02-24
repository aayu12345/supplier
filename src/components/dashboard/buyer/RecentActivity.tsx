"use client";

import { FileText, CheckCircle, Package, Clock, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Activity {
    id: string;
    rfq_number: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export default function RecentActivity() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchActivities() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("rfqs")
                .select("id, rfq_number, status, created_at, updated_at")
                .eq("user_id", user.id)
                .order("updated_at", { ascending: false });

            if (data) {
                setActivities(data);
            }
            setLoading(false);
        }
        fetchActivities();
    }, []);

    const getActivityConfig = (status: string) => {
        switch (status) {
            case "Pending":
                return { icon: Clock, color: "text-orange-500", bg: "bg-orange-100", text: "Created RFQ" };
            case "Quoted":
                return { icon: FileText, color: "text-blue-500", bg: "bg-blue-100", text: "Received Quote for" };
            case "Approved":
                return { icon: CheckCircle, color: "text-green-500", bg: "bg-green-100", text: "Approved Order" };
            case "Negotiation":
                return { icon: AlertCircle, color: "text-purple-500", bg: "bg-purple-100", text: "Negotiating" };
            default:
                return { icon: FileText, color: "text-gray-500", bg: "bg-gray-100", text: "Updated" };
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="h-6 w-32 bg-gray-200 rounded mb-6" />
                <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4">
                            <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-200 rounded w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
                <p className="text-gray-500 text-sm text-center py-8">No recent activity.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>

            <div className="flex flex-row overflow-x-auto pb-4 gap-6 scrollbar-hide">
                {activities.map((activity, index) => {
                    const config = getActivityConfig(activity.status);
                    const isLast = index === activities.length - 1;
                    return (
                        <div key={activity.id} className="relative flex flex-col items-start gap-3 min-w-[200px] flex-1">
                            {/* Horizontal connecting line */}
                            {!isLast && (
                                <div className="absolute top-4 left-8 right-[-1.5rem] h-[2px] bg-gray-100 z-0"></div>
                            )}

                            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${config.bg} ${config.color} shrink-0 ring-4 ring-white`}>
                                <config.icon className="h-4 w-4" />
                            </div>

                            <div>
                                <p className="text-sm text-gray-800 font-medium leading-snug line-clamp-2">
                                    {config.text} {activity.rfq_number}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(activity.updated_at).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
