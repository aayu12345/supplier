"use client";

import { Settings as SettingsIcon, Bell, Lock, Globe } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500">Manage your account preferences</p>
                </div>

                <div className="space-y-6">
                    {/* Notifications */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Bell className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                        </div>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm text-gray-700">Email notifications for new RFQs</span>
                                <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm text-gray-700">Quote status updates</span>
                                <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm text-gray-700">Order confirmations</span>
                                <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
                            </label>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-bold text-gray-900">Security</h2>
                        </div>
                        <div className="space-y-3">
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200">
                                Change Password
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200">
                                Two-Factor Authentication
                            </button>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Globe className="h-5 w-5 text-gray-600" />
                            <h2 className="text-lg font-bold text-gray-900">Preferences</h2>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                <select className="w-full p-2 border border-gray-300 rounded-lg">
                                    <option>English</option>
                                    <option>Hindi</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                                <select className="w-full p-2 border border-gray-300 rounded-lg">
                                    <option>IST (UTC+5:30)</option>
                                    <option>UTC</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
