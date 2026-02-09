"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    Clock,
    CheckCircle,
    XCircle,
    Upload,
    FileText,
    AlertTriangle,
    Calendar
} from "lucide-react";
import { clsx } from "clsx";
import { ActivityType } from "@/lib/actions/timeline";

type Activity = {
    id: string;
    activity_type: ActivityType;
    description: string;
    created_at: string;
    performed_by: string;
    rfq_id?: string;
    performer?: {
        name?: string;
        company_name?: string;
        email?: string;
        role?: string;
    };
    rfq?: {
        rfq_number: string;
    };
};

export default function ActivityTimeline({ supplierId }: { supplierId: string }) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        fetchActivities();

        const subscription = supabase
            .channel('timeline_channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'quote_activities',
                    filter: `supplier_id=eq.${supplierId}`,
                },
                (payload) => {
                    console.log('New activity!', payload);
                    fetchActivities();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [supplierId]);

    const fetchActivities = async () => {
        try {
            setErrorMsg(null);
            console.log("Fetching activities for:", supplierId);

            const { data, error } = await supabase
                .from('quote_activities')
                .select(`
                    *,
                    rfq:rfq_id (
                        rfq_number
                    ),
                    performer:performed_by (
                        name,
                        company_name,
                        email,
                        role
                    )
                `)
                .eq('supplier_id', supplierId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("[Timeline] Error fetching activities:", error);

                // Try to serialize error if it's an object
                let msg = error.message;
                if (!msg && typeof error === 'object') {
                    msg = JSON.stringify(error);
                }

                setErrorMsg(msg || "Unknown error occurred");
                return;
            }

            if (data) {
                console.log("[Timeline] Activities found:", data.length);
                setActivities(data as Activity[]);
            }
        } catch (e: any) {
            console.error("[Timeline] Unexpected error:", e);
            setErrorMsg(e.message || "Unexpected error");
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: ActivityType) => {
        switch (type) {
            case 'RFQ_ASSIGNED': return <FileText className="h-5 w-5 text-blue-500" />;
            case 'QUOTE_SUBMITTED': return <Upload className="h-5 w-5 text-purple-500" />;
            case 'QUOTE_APPROVED': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'QUOTE_REJECTED': return <XCircle className="h-5 w-5 text-red-500" />;
            case 'DELAY_NOTED': return <Clock className="h-5 w-5 text-orange-500" />;
            case 'PI_UPLOADED': return <FileText className="h-5 w-5 text-indigo-500" />;
            case 'SCHEDULE_MISSED': return <AlertTriangle className="h-5 w-5 text-red-600" />;
            default: return <Calendar className="h-5 w-5 text-gray-500" />;
        }
    };

    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [logType, setLogType] = useState<ActivityType>('DELAY_NOTED');
    const [logDescription, setLogDescription] = useState('');
    const [isLogging, setIsLogging] = useState(false);

    // ... existing useEffect ...

    const handleLogEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLogging(true);
        const { logActivity } = await import("@/lib/actions/timeline");

        const result = await logActivity(supplierId, logType, logDescription);

        if (result.error) {
            alert("Failed to log event: " + result.error);
        } else {
            setIsLogModalOpen(false);
            setLogDescription('');
            // fetchActivities will be triggered by realtime
        }
        setIsLogging(false);
    };



    // ... getIcon ...

    // ... handleLogEvent ...

    if (loading) return <div className="text-center text-gray-500 py-4">Loading timeline...</div>;

    if (errorMsg) return (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
            <p className="font-bold">Error loading timeline:</p>
            <p>{errorMsg}</p>
            <p className="text-xs mt-2">Supplier ID: {supplierId}</p>
            <button onClick={() => fetchActivities()} className="mt-2 text-sm underline">Retry</button>
        </div>
    );

    return (
        <div className="flow-root">
            {/* ... rest of component ... */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Activity Timeline</h3>
                <button
                    onClick={() => setIsLogModalOpen(true)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1 px-3 rounded flex items-center gap-1"
                >
                    + Log Event
                </button>
            </div>

            {isLogModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h4 className="text-lg font-bold mb-4">Log Manual Event</h4>
                        <form onSubmit={handleLogEvent}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={logType}
                                    onChange={(e) => setLogType(e.target.value as ActivityType)}
                                >
                                    <option value="DELAY_NOTED">Delay Noted</option>
                                    <option value="SCHEDULE_MISSED">Production Schedule Missed</option>
                                    <option value="RFQ_ASSIGNED">RFQ Assigned</option>
                                    <option value="PI_UPLOADED">PI Uploaded</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full p-2 border rounded-md"
                                    rows={3}
                                    value={logDescription}
                                    onChange={(e) => setLogDescription(e.target.value)}
                                    placeholder="Enter details about this event..."
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsLogModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLogging}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isLogging ? 'Logging...' : 'Log Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ul role="list" className="-mb-8">
                {activities.length === 0 ? (
                    <li className="text-gray-500 text-sm italic py-4">
                        No activity recorded yet for Supplier ID: {supplierId}
                        <br />
                        <span className="text-xs text-gray-400">
                            (If you just added an event, please wait a moment or refresh. Realtime status: Connected)
                        </span>
                    </li>
                ) : (
                    activities.map((activity, activityIdx) => (
                        <li key={activity.id}>
                            <div className="relative pb-8">
                                {activityIdx !== activities.length - 1 ? (
                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                ) : null}
                                <div className="relative flex space-x-3">
                                    <div className="bg-white rounded-full flex items-center justify-center ring-8 ring-white">
                                        {getIcon(activity.activity_type)}
                                    </div>
                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                        <div>
                                            <p className="text-sm text-gray-900 font-medium">
                                                {/* Clean up legacy description containing UUIDs */}
                                                {activity.description.replace(/for RFQ: [a-f0-9-]{36}/i, '')}

                                                {activity.rfq?.rfq_number && (
                                                    <a href={`/admin/buyers/rfqs/${activity.rfq_id}`} className="ml-2 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 font-mono hover:bg-blue-100 hover:underline transition-colors">
                                                        {activity.rfq.rfq_number}
                                                    </a>
                                                )}
                                            </p>
                                            <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                                                <span>by</span>
                                                <span className="font-medium text-gray-700">
                                                    {activity.performer ?
                                                        (activity.performer.name || activity.performer.company_name || activity.performer.email || 'Unknown')
                                                        : 'System'}
                                                </span>
                                                {activity.performer?.role && (
                                                    <span className="text-gray-400">({activity.performer.role})</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right text-xs whitespace-nowrap text-gray-500">
                                            <time dateTime={activity.created_at}>
                                                {new Date(activity.created_at).toLocaleString()}
                                            </time>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
