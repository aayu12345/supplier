"use client";

import { Bell, Search, Upload, LogOut, LogIn, User, Settings, ChevronDown } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import Link from "next/link";
import { useState } from "react";

interface DashboardHeaderProps {
    userName: string;
    onUploadClick: () => void;
    isLoggedIn?: boolean;
}

export default function DashboardHeader({ userName, onUploadClick, isLoggedIn = true }: DashboardHeaderProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

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

                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors relative">
                        <Bell className="h-6 w-6" />
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    {/* Profile Dropdown */}
                    {isLoggedIn ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-full transition-colors border border-transparent hover:border-gray-200"
                            >
                                <div className="h-9 w-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                                        <p className="text-xs text-gray-500">Buyer Account</p>
                                    </div>
                                    <Link
                                        href="/dashboard/buyer/settings"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Account Settings
                                    </Link>
                                    <div className="h-px bg-gray-100 my-1"></div>
                                    <form action={signOut}>
                                        <button type="submit" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                            <LogOut className="h-4 w-4" />
                                            Sign Out
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/auth/login" className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Log In">
                            <LogIn className="h-6 w-6" />
                        </Link>
                    )}
                </div>

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
