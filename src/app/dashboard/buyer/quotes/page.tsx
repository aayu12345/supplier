import { Bell } from "lucide-react";
import QuotesTable from "@/components/dashboard/buyer/quotes/QuotesTable";

export default function QuotesPage() {
    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Page Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
                    <button className="relative p-2 text-gray-500 hover:bg-white rounded-full transition-all">
                        <Bell className="h-6 w-6" />
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                </div>

                <QuotesTable />

            </div>
        </div>
    );
}
