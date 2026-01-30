import { FileText, CheckCircle, Package } from "lucide-react";

export default function RecentActivity() {
    const activities = [
        {
            id: 1,
            text: "Precision Works submitted quote for RFQ-2024-001",
            date: "Today",
            icon: FileText,
            color: "text-blue-500",
            bgColor: "bg-blue-100",
        },
        {
            id: 2,
            text: "Tech Manufacturing approved RFQ-2024-003",
            date: "Apr 16, 2024",
            icon: CheckCircle,
            color: "text-green-500",
            bgColor: "bg-green-100",
        },
        {
            id: 3,
            text: "Beta Engineering received order #PO-98765",
            date: "Apr 16, 2024",
            icon: Package,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100",
        },
        {
            id: 4,
            text: "Beta Engineering received order #PO-98765",
            date: "Apr 15, 2024",
            icon: Package,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100",
        },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>

            <div className="space-y-8 relative">
                {/* Vertical connecting line */}
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100"></div>

                {activities.map((activity) => (
                    <div key={activity.id} className="relative flex gap-4">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${activity.bgColor} ${activity.color} shrink-0`}>
                            <activity.icon className="h-4 w-4" />
                        </div>

                        <div>
                            <p className="text-sm text-gray-800 font-medium leading-relaxed">
                                {activity.text}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
