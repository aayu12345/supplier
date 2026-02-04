"use client";

import { useState } from "react";
import { X, Upload, CheckCircle } from "lucide-react";
import { submitOrderUpdate } from "@/app/dashboard/supplier/actions";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    orderNumber: string;
};

const STAGES = [
    "Production Started",
    "Material Procurement",
    "Machining / Fabrication",
    "Surface Treatment",
    "Quality Control",
    "Packaging",
    "Ready for Dispatch",
    "Shipped"
];

export default function UpdateOrderModal({ isOpen, onClose, orderId, orderNumber }: Props) {
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData(e.currentTarget);
        formData.append("orderId", orderId);

        const result = await submitOrderUpdate(formData);
        console.log(result);
        if (result.error) {
            alert("Error: " + result.error);
        } else {
            alert("Update Submitted Successfully!");
            onClose();
            // Typically we'd trigger a refresh here, usually handled by parent revalidation or router refresh
            window.location.reload(); // Simple reload for now to see updates
        }
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Update Order</h3>
                        <p className="text-sm text-gray-500">PO #{orderNumber}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="h-5 w-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Stage Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Production Update</label>
                        <select name="stage" required className="input-field w-full">
                            <option value="">Select Stage...</option>
                            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description / Note</label>
                        <textarea
                            name="description"
                            placeholder="Enter production update details..."
                            required
                            className="input-field w-full h-32 resize-none"
                        ></textarea>
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                        <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                name="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-2">
                                <span className="bg-gray-100 p-2 rounded-full">
                                    <Upload className="h-5 w-5 text-gray-500" />
                                </span>
                                <span className="text-sm text-gray-600 font-medium">+ Upload Files</span>
                                <span className="text-xs text-gray-400">Images, Videos, PDFs supported</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary w-full py-3 text-base flex justify-center items-center gap-2"
                    >
                        {submitting ? "Submitting..." : "Submit Update"}
                    </button>

                </form>

                {/* Ad Placeholder inside Modal? No, usually outside. */}
                <div className="px-6 pb-6">
                    <div className="bg-gray-50 border border-gray-100 rounded p-2 text-center">
                        <span className="text-xs text-gray-400 font-medium">Google AdSense Placeholder</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
