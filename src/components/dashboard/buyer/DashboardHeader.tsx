import { Bell, Search, Upload, LogOut, LogIn } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import Link from "next/link";

interface DashboardHeaderProps {
    userName: string;
    onUploadClick: () => void;
    isLoggedIn?: boolean;
}

export default function DashboardHeader({ userName, onUploadClick, isLoggedIn = true }: DashboardHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Good evening, {userName} <span className="text-2xl">👋</span>
                </h1>
                <p className="text-gray-500">Manage your RFQs, orders, and payments</p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                </div>

                <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors relative">
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {isLoggedIn ? (
                    <form action={signOut}>
                        <button type="submit" className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Log Out">
                            <LogOut className="h-6 w-6" />
                        </button>
                    </form>
                ) : (
                    <Link href="/auth/login" className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Log In">
                        <LogIn className="h-6 w-6" />
                    </Link>
                )}

                <button
                    onClick={onUploadClick}
                    className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Upload className="h-5 w-5" />
                    Upload RFQ
                </button>
            </div>
        </div>
    );
}
