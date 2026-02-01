"use client";

import { CheckCircle2, Circle, Clock, FileText } from "lucide-react";

export type TimelineEvent = {
    id: string;
    title: string;
    description?: string;
    status: "Completed" | "Pending";
    created_at: string;
    file_url?: string;
    file_name?: string;
};

// Mock data for now if no events exist
const DEMO_EVENTS: TimelineEvent[] = [
    { id: "1", title: "Order Confirmed", description: "PO Received and accepted.", status: "Completed", created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: "2", title: "Raw Material Received", description: "Material SS304 Grade verified.", status: "Completed", created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: "3", title: "Machining Started", description: "CNC turning in progress.", status: "Pending", created_at: new Date().toISOString() },
];

export default function OrderTimeline({ events = [] }: { events?: TimelineEvent[] }) {
    // changing logic: if events are empty, show empty state or use demo for visualization during dev?
    // Let's stick to true data but fall back gracefully.
    const displayEvents = events.length > 0 ? events : []; // Empty by default

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Order Tracking</h3>

            {displayEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Clock className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p>No timeline updates yet.</p>
                </div>
            ) : (
                <div className="relative pl-4 space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {displayEvents.map((event, index) => (
                        <div key={event.id} className="relative flex items-start group is-active">
                            {/* Icon */}
                            <div className={`absolute left-0 h-10 w-10 flex items-center justify-center rounded-full border-2 bg-white z-10 ${event.status === "Completed" ? "border-blue-600 text-blue-600" : "border-gray-300 text-gray-300"
                                }`}>
                                {event.status === "Completed" ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                            </div>

                            {/* Content */}
                            <div className="pl-14 w-full">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                                    <h4 className={`text-base font-bold ${event.status === "Completed" ? "text-gray-900" : "text-gray-500"}`}>
                                        {event.title}
                                    </h4>
                                    <span className="text-xs text-gray-400 mt-1 sm:mt-0 font-medium font-mono">
                                        {new Date(event.created_at).toLocaleDateString("en-US", { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                                {event.description && (
                                    <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                                )}
                                {event.file_url && (
                                    <a href={event.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-xs font-medium text-blue-600 transition-colors">
                                        <FileText className="h-3 w-3" />
                                        {event.file_name || "View Attachment"}
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
