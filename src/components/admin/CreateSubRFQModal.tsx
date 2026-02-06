"use client";

import { useState } from "react";
import { Upload, X, Calendar, FileText, AlertCircle, Save } from "lucide-react";
import { createSubRFQ } from "@/app/admin/actions";

type CreateSubRFQModalProps = {
    isOpen: boolean;
    onClose: () => void;
    parentId: string;
    parentRfqNumber: string;
    userId: string;
    itemData?: any;
};

export default function CreateSubRFQModal({ isOpen, onClose, parentId, parentRfqNumber, userId, itemData }: CreateSubRFQModalProps) {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const subRfqPlaceholder = `${parentRfqNumber}-XX`;

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        formData.append("parentId", parentId);
        formData.append("parentRfqNumber", parentRfqNumber);
        formData.append("userId", userId);
        formData.append("rfqType", 'single');

        if (file) {
            formData.append("drawing", file);
        }

        const result = await createSubRFQ(formData);

        setLoading(false);
        if (result.error) {
            alert(result.error);
        } else {
            alert("Sub-RFQ Draft Created Successfully!");
            onClose();
            window.location.reload();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8 max-h-[95vh] flex flex-col">

                {/* Fixed Header */}
                <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-5 border-b border-blue-100 flex items-center justify-between flex-shrink-0 rounded-t-xl">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Go Live RFQ - Supplier Lead Form</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Create a comprehensive production draft</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Scrollable Form Content */}
                <div className="overflow-y-auto flex-1">
                    <form onSubmit={handleSubmit} className="divide-y divide-gray-100">

                        {/* SECTION 1: TOP INFO */}
                        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/50">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Parent RFQ #</label>
                                <input disabled value={parentRfqNumber} className="w-full bg-gray-100 border border-gray-200 text-gray-500 rounded px-3 py-2 font-mono text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sub RFQ #</label>
                                <input disabled value={subRfqPlaceholder} className="w-full bg-gray-100 border border-gray-200 text-gray-400 rounded px-3 py-2 font-mono text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Part Name <span className="text-red-500">*</span></label>
                                <input name="partName" placeholder="e.g. Precision Shaft" className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow" required />
                            </div>
                        </div>

                        {/* SECTION 2: DRAWING & NOTES */}
                        <div className="px-6 py-5 space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 border-l-4 border-blue-600 pl-3">Upload Drawing</h3>

                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Upload Box */}
                                <div className="flex-1">
                                    <div className="border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/30 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer relative group h-full min-h-[120px] flex flex-col items-center justify-center text-center p-4">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        />
                                        {file ? (
                                            <div className="flex items-center gap-3">
                                                <div className="bg-green-100 p-2 rounded-full text-green-600">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-gray-900 text-sm">{file.name}</p>
                                                    <p className="text-xs text-green-600 font-medium">Ready to upload</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="h-7 w-7 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                                                <p className="text-sm font-medium text-blue-900">Upload File</p>
                                                <p className="text-xs text-blue-400 mt-1">PDF, STEP, DWG</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Critical Notes */}
                                <div className="flex-[2]">
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Critical Notes</label>
                                    <textarea
                                        name="notes"
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-yellow-50/50 focus:bg-white transition-colors"
                                        placeholder="e.g. Tight tolerances required..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: SPECIFICATIONS */}
                        <div className="px-6 py-5 space-y-4 bg-gray-50/30">
                            <h3 className="text-sm font-bold text-gray-900 border-l-4 border-green-600 pl-3">Specifications</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-600">Material Size</label>
                                    <div className="relative">
                                        <input name="materialSize" placeholder="20x2x100" className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                        <span className="absolute right-3 top-2 text-gray-400 text-xs pointer-events-none">mm</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-600">Miet (approx.)</label>
                                    <div className="relative">
                                        <input name="mietWeight" type="number" step="0.01" placeholder="0.5" className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                        <span className="absolute right-3 top-2 text-gray-400 text-xs pointer-events-none">kg</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-600">Sample Qty</label>
                                    <input name="sampleQty" type="number" placeholder="5" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-600">Sample Lead Time</label>
                                    <input name="sampleLeadTime" placeholder="e.g. 5 days" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-600">Total Process</label>
                                    <input name="totalProcess" placeholder="e.g. CNC Turning" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-600">Material</label>
                                    <input name="material" placeholder="e.g. EN8 Steel" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-600">Surface Finishing</label>
                                    <input name="surfaceFinishing" placeholder="e.g. Zinc Plating" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-600">Hardness</label>
                                    <input name="hardness" placeholder="---" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 4: TARGET PRICE */}
                        <div className="px-6 py-4 bg-blue-50/50 border-y border-blue-100">
                            <div className="flex items-center gap-4">
                                <label className="text-sm font-bold text-gray-900 whitespace-nowrap">Target Price:</label>
                                <div className="relative max-w-[200px]">
                                    <span className="absolute left-3 top-2 font-bold text-gray-700">₹</span>
                                    <input
                                        name="targetPrice"
                                        type="number"
                                        step="0.01"
                                        placeholder="250.00"
                                        className="w-full pl-7 pr-3 py-2 border border-blue-300 rounded-lg font-bold text-lg text-blue-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <span className="text-gray-500 text-sm">per / piece</span>
                            </div>
                        </div>

                        {/* SECTION 5: PRODUCTION DETAILS */}
                        <div className="px-6 py-5 space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 border-l-4 border-orange-600 pl-3">Production Details</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-600">Production Remarks</label>
                                    <input name="productionRemarks" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-600">Job Warnings</label>
                                    <input name="jobWarnings" className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-red-50 border-red-100 focus:border-red-300 focus:ring-red-200 outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 6: FUTURE DEMAND */}
                        <div className="px-6 py-5 bg-gray-50/50 space-y-3">
                            <h3 className="text-sm font-bold text-gray-900 border-l-4 border-purple-600 pl-3">Future Demand</h3>
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-600">Date</label>
                                    <input name="futureWeek" type="date" className="border border-gray-300 rounded px-3 py-2 w-48 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="flex gap-4 items-center">
                                    <label className="text-xs font-bold text-gray-600">Frequency:</label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" name="demandFreq" value="Monthly" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        <span className="text-sm text-gray-700">Monthly</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" name="demandFreq" value="Quarterly" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        <span className="text-sm text-gray-700">Quarterly</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" name="demandFreq" value="Annual" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        <span className="text-sm text-gray-700">Annual</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* FOOTER ACTIONS - Fixed at bottom */}
                        <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-center sticky bottom-0">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-700 text-white font-bold text-base px-10 py-3 rounded-lg hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? (
                                    "Saving Draft..."
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        Save as Draft
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
