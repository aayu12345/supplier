"use client";

import { useActionState, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { updateSupplierProfile } from "./actions";
import { User, Building2, CreditCard, FileText, Upload, Shield, Star, AlertCircle, Save } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
            <Save className="h-4 w-4" />
            {pending ? "Saving..." : "Save Changes"}
        </button>
    );
}

export default function ProfileView({ profile, metrics }: { profile: any, metrics: any }) {
    const [state, formAction] = useActionState(updateSupplierProfile, null);

    // Bank Details Helper
    const bank = profile?.bank_details || {};
    const docs = profile?.documents || {};

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto pb-20">

            {/* LEFT COLUMN: Forms */}
            <div className="lg:col-span-2 space-y-8">
                <form action={formAction} className="space-y-8">

                    {/* Success/Error Messages */}
                    {state?.success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-green-600" />
                            <p className="text-sm text-green-700">{state.success}</p>
                        </div>
                    )}
                    {state?.error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <p className="text-sm text-red-700">{state.error}</p>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                Company Information
                            </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Company Name</label>
                                <input type="text" name="company_name" defaultValue={profile?.company_name} placeholder="e.g. Silver Engineering" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">GSTIN</label>
                                <input type="text" name="gstin" defaultValue={profile?.gstin} placeholder="e.g. 22AAAAA0000A1Z5" className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Contact Person</label>
                                <input type="text" name="contact_person" defaultValue={profile?.contact_person} placeholder="Full Name" className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email (Read-only)</label>
                                <input type="email" name="email" defaultValue={profile?.email} readOnly className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Phone</label>
                                <input type="tel" name="phone" defaultValue={profile?.phone} placeholder="+91 98765 43210" className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-gray-700">Registered Address</label>
                                <textarea name="address" defaultValue={profile?.address} rows={2} placeholder="Full Address" className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                        </div>
                    </div>

                    {/* 2. Bank Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-green-600" />
                                Bank & Payment Info
                            </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Bank Name</label>
                                <input type="text" name="bank_name" defaultValue={bank.bank_name} placeholder="e.g. HDFC Bank" className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Account Number</label>
                                <input type="text" name="account_number" defaultValue={bank.account_number} className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">IFSC Code</label>
                                <input type="text" name="ifsc_code" defaultValue={bank.ifsc_code} className="w-full p-2 border border-gray-300 rounded-lg uppercase" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">UPI ID (Optional)</label>
                                <input type="text" name="upi_id" defaultValue={bank.upi_id} placeholder="silver@okhdfcbank" className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <SubmitButton />
                    </div>
                </form>

                {/* 3. Documents (Separate UI for clarity) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-purple-600" />
                            Certificates & Docs
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <DocRow label="ISO Certification" status={docs.iso_certificate?.status || "Pending"} docType="iso_certificate" />
                        <DocRow label="MSME Certificate" status={docs.msme_certificate?.status || "Pending"} docType="msme_certificate" />
                        <DocRow label="Company Capacities" status={docs.capabilities?.status || "Pending"} docType="capabilities" />
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Trust Score & Sidebar */}
            <div className="space-y-6">

                {/* Trust Score Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-gray-900 text-lg">Trust Score</h3>
                        <div className="bg-gray-100 p-1 rounded-full text-gray-400">
                            <AlertCircle className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-5xl font-extrabold text-gray-900">{metrics?.trust_score || 4.7}</span>
                        <span className="text-gray-400 font-medium text-lg">/ 5</span>
                    </div>

                    <div className="space-y-4">
                        <ScoreRow label="Timing" score={metrics?.performance_ratings?.timing || 80} color="bg-blue-500" />
                        <ScoreRow label="Quality" score={metrics?.performance_ratings?.quality || 95} color="bg-blue-500" />
                        <ScoreRow label="Packaging" score={metrics?.performance_ratings?.packaging || 70} color="bg-blue-500" />
                        <ScoreRow label="Communication" score={metrics?.performance_ratings?.communication || 90} color="bg-blue-500" />
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-blue-600 font-medium hover:underline cursor-pointer">
                        Learn how trust scores are calculated
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Security</h3>
                    <button className="w-full py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Change Password
                    </button>
                    <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                        <span>2FA (Coming Soon)</span>
                        <div className="w-8 h-4 bg-gray-200 rounded-full"></div>
                    </div>
                </div>

                {/* Ad Banner Vertical/Small */}
                <div className="w-full bg-yellow-50 rounded-lg border border-yellow-200 p-4 relative overflow-hidden">
                    <div className="absolute top-2 right-2 bg-yellow-200 px-1 rounded text-[10px] font-bold text-gray-500 uppercase">Ad</div>
                    <p className="text-sm font-bold text-gray-900 mb-1">Get Certified!</p>
                    <p className="text-xs text-gray-600 mb-3">Boost your Trust Score with ISO 9001.</p>
                    <button className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded">Learn More</button>
                </div>

            </div>
        </div>
    );
}

function ScoreRow({ label, score, color }: { label: string, score: number, color: string }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-gray-600">
                <span>{label}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`${color} h-2 rounded-full`} style={{ width: `${score}%` }}></div>
            </div>
        </div>
    );
}

function DocRow({ label, status, docType }: { label: string, status: string, docType: string }) {
    const isApproved = status === "Approved";
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('docType', docType);

        try {
            const response = await fetch('/api/upload-document', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('Document uploaded successfully! Admin will review it.');
                window.location.reload();
            } else {
                alert('Upload failed. Please try again.');
            }
        } catch (error) {
            alert('Upload error. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors bg-white">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isApproved ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>
                    <FileText className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-gray-900">{label}</span>
            </div>

            <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${isApproved ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-600"}`}>
                    {status}
                </span>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    title="Upload Document"
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                    {uploading ? (
                        <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    ) : (
                        <Upload className="h-4 w-4" />
                    )}
                </button>
            </div>
        </div>
    );
}

