"use client";

import { X, Calendar, Info } from "lucide-react";
import { useState } from "react";
import FileUploadZone from "@/components/ui/FileUploadZone";

interface RFQUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoggedIn?: boolean; // To allow usage later when we check logged in state for fields
}

import { useRouter } from "next/navigation";

export default function RFQUploadModal({ isOpen, onClose, isLoggedIn = true }: RFQUploadModalProps) {
    const [rfqType, setRfqType] = useState<"single" | "multiple">("single");
    const [file, setFile] = useState<File | null>(null);
    const router = useRouter();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert("Please upload a drawing file.");
            return;
        }

        const form = e.target as HTMLFormElement;
        const data = new FormData(form);

        data.set("file", file);
        data.set("type", rfqType);

        // Call Server Action
        const { submitRFQ } = await import("@/app/dashboard/buyer/actions");
        const result = await submitRFQ(data);

        if (result?.error) {
            alert(result.error);
        } else if (result?.success) {
            alert("Thank you! Your RFQ has been submitted. You can track it from the Quotes section.");
            onClose();
            router.push("/dashboard/buyer/quotes");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-900">Request a Quote</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Section 1: File Upload */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                1. Upload Drawing <span className="text-red-500">*</span>
                            </h3>
                        </div>
                        <FileUploadZone onFileSelect={setFile} selectedFile={file} />
                    </section>

                    {/* Section 2: RFQ Type */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                            2. RFQ Type
                        </h3>
                        <div className="bg-gray-100 p-1 rounded-lg inline-flex w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => setRfqType("single")}
                                className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${rfqType === "single"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                Single Item RFQ
                            </button>
                            <button
                                type="button"
                                onClick={() => setRfqType("multiple")}
                                className={`flex-1 sm:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${rfqType === "multiple"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                Multiple Items RFQ
                            </button>
                        </div>
                    </section>

                    {/* Section 3: Conditional Fields */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {rfqType === "single" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity
                                </label>
                                <input
                                    name="quantity"
                                    type="number"
                                    placeholder="e.g. 100"
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        )}

                        <div className={rfqType === "multiple" ? "md:col-span-2" : ""}>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                Lead Time (Optional)
                            </label>
                            <input
                                name="lead_time"
                                type="date" // Calendar input
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {rfqType === "single" && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Target Price (Optional)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        name="target_price"
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes
                            </label>
                            <textarea
                                name="notes"
                                rows={3}
                                placeholder={
                                    rfqType === "single"
                                        ? "Critical dimensions, special instructions..."
                                        : "Common requirements for all items..."
                                }
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>
                    </section>

                    {/* Section 4: New User Info */}
                    {!isLoggedIn && (
                        <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4">
                                Your Contact Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="contact_name" type="text" placeholder="Contact Person" className="w-full px-4 py-2.5 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none" required />
                                <input name="contact_email" type="email" placeholder="Email Address" className="w-full px-4 py-2.5 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none" required />
                                <input name="contact_phone" type="tel" placeholder="Phone Number" className="w-full md:col-span-2 px-4 py-2.5 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none" required />
                                <p className="text-xs text-blue-600 md:col-span-2 mt-1">
                                    * We will automatically create an account for you to track this quote.
                                </p>
                            </div>
                        </section>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-200 transition-all active:scale-95"
                        >
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
