"use client";

import { useState } from "react";
import { User, Building, MapPin, Shield, Bell, Save, Upload } from "lucide-react";
import { updateProfile } from "@/app/dashboard/buyer/settings/actions";

type ProfileData = {
    name?: string;
    email?: string;
    phone?: string;
    designation?: string;
    alternate_contact?: string;
    company_name?: string;
    business_type?: string;
    website?: string;
    gst_number?: string;
    pan_number?: string;
    country?: string;
    currency?: string;
    registered_address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    dispatch_address?: string;
};

export default function SettingsForm({ initialData, userEmail }: { initialData: ProfileData, userEmail: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [country, setCountry] = useState(initialData.country || "India");

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        try {
            const result = await updateProfile(formData);
            if (result.error) {
                alert(result.error);
            } else {
                alert("Settings saved successfully!");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-12">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-gray-500">Manage your profile, company details, and preferences.</p>
                </div>
                <div className="flex gap-3">
                    <button type="button" className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm flex items-center gap-2 disabled:opacity-70"
                    >
                        {isLoading ? "Saving..." : <><Save className="h-4 w-4" /> Save Changes</>}
                    </button>
                </div>
            </div>

            {/* Section 1: Contact Person */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <User className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Contact Person</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input name="name" defaultValue={initialData.name} type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
                        <input type="email" value={userEmail} disabled className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input name="phone" defaultValue={initialData.phone} type="tel" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                        <input name="designation" defaultValue={initialData.designation} type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Procurement Manager" />
                    </div>
                </div>
            </section>

            {/* Section 2: Company Info */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Building className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Company Information</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                        <input name="company_name" defaultValue={initialData.company_name} type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type of Business</label>
                        <select name="business_type" defaultValue={initialData.business_type} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="">-- Please select --</option>
                            <option value="Manufacturer">Manufacturer</option>
                            <option value="OEM">OEM</option>
                            <option value="Trader">Trader</option>
                            <option value="Service Provider">Service Provider</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <select
                            name="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="India">India</option>
                            <option value="USA">USA</option>
                            <option value="Germany">Germany</option>
                            <option value="Japan">Japan</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency Preference</label>
                        <select name="currency" defaultValue={initialData.currency} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none">
                            <option value="INR">INR - Indian Rupee</option>
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                        </select>
                    </div>

                    {/* Conditional Fields for India */}
                    {country === "India" && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                                <input name="gst_number" defaultValue={initialData.gst_number} type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none uppercase" placeholder="22AAAAA0000A1Z5" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                                <input name="pan_number" defaultValue={initialData.pan_number} type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none uppercase" />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        <input name="website" defaultValue={initialData.website} type="url" placeholder="https://" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">MSME Certificate (Optional)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
                            <Upload className="h-6 w-6 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Click to upload PDF</p>
                            <input type="file" className="hidden" accept=".pdf" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Address */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <MapPin className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Address</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Registered Address *</label>
                        <input name="registered_address" defaultValue={initialData.registered_address} placeholder="Street Address, Area" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input name="city" defaultValue={initialData.city} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State / Province *</label>
                        <input name="state" defaultValue={initialData.state} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                        <input name="postal_code" defaultValue={initialData.postal_code} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>

                    <div className="md:col-span-2 mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dispatch Address (if different)</label>
                        <input name="dispatch_address" defaultValue={initialData.dispatch_address} placeholder="Same as registered address if left blank" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                </div>
            </section>

            {/* Section 4: Security */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-gray-900">Account Security</h2>
                    </div>
                    <button type="button" className="text-sm text-blue-600 hover:underline">Forgot password?</button>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password (optional)</label>
                        <input name="current_password" type="password" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div></div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input name="new_password" type="password" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input name="confirm_password" type="password" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                </div>
            </section>

            {/* Section 5: Preferences */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Bell className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">Email Updates</p>
                            <p className="text-sm text-gray-500">Receive RFQ status and invoice alerts</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">WhatsApp Updates</p>
                            <p className="text-sm text-gray-500">Get important alerts on WhatsApp</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </section>

            {/* Support */}
            <div className="text-center pt-8 border-t border-gray-200">
                <p className="text-gray-500">Need help?</p>
                <div className="flex justify-center gap-4 mt-2">
                    <a href="mailto:support@thesupplier.in" className="text-blue-600 hover:underline">support@thesupplier.in</a>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-700">+91 98765 43210</span>
                </div>
            </div>

        </form>
    );
}
