"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitQuote } from "./actions";
import { FileText, Package, Calendar, Upload, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? "Submitting..." : "Submit Quote"}
        </button>
    );
}

export default function QuoteForm({ rfq, costBreakdownEnabled }: { rfq: any; costBreakdownEnabled: boolean }) {
    const [state, formAction] = useActionState(submitQuote, null);
    const [materialCost, setMaterialCost] = useState(0);
    const [operationCost, setOperationCost] = useState(0);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [commitmentAccepted, setCommitmentAccepted] = useState(false);

    const totalPrice = materialCost + operationCost;
    const canSubmit = termsAccepted && commitmentAccepted;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Submit Your Quote</h1>
                <p className="text-gray-500">Fill in your pricing and delivery details</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT SIDE: RFQ Details + Vertical Ad */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Vertical Ad Banner */}
                    <div className="bg-yellow-50 rounded-xl border-2 border-yellow-200 p-6 min-h-[400px] flex flex-col items-center justify-center relative">
                        <div className="absolute top-3 right-3 bg-yellow-200 px-2 py-0.5 rounded text-xs font-bold text-gray-600">
                            Ad
                        </div>
                        <div className="text-center space-y-4">
                            <div className="text-6xl">📢</div>
                            <h3 className="font-bold text-gray-900 text-xl">Your Ad Here</h3>
                            <p className="text-sm text-gray-600">Promote your services</p>
                            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
                                Learn More
                            </button>
                        </div>
                        <div className="absolute bottom-3 text-xs text-gray-400">Google Ads</div>
                    </div>

                    {/* RFQ Summary Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="font-bold text-gray-900 text-lg border-b pb-3">RFQ Details</h3>

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 font-medium">RFQ Number</p>
                                <p className="text-sm font-bold text-gray-900">{rfq.rfq_number}</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 font-medium">Material / Part</p>
                                <p className="text-sm font-bold text-gray-900">{rfq.file_name}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Quantity</p>
                                    <p className="text-sm font-bold text-gray-900">{rfq.quantity}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Lead Time</p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {rfq.lead_time ? new Date(rfq.lead_time).toLocaleDateString() : "N/A"}
                                    </p>
                                </div>
                            </div>

                            {rfq.type && (
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Type</p>
                                    <p className="text-sm font-bold text-gray-900">{rfq.type}</p>
                                </div>
                            )}

                            {/* Drawing/Image Placeholder */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">Drawing/Image</p>
                                <button className="text-xs text-blue-600 hover:underline mt-1">
                                    Click to view
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Quote Form */}
                <div className="lg:col-span-2">
                    <form action={formAction} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">
                        <input type="hidden" name="rfq_id" value={rfq.id} />

                        <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Give us your price</h2>

                        {state?.error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700">{state.error}</p>
                            </div>
                        )}

                        {/* Pricing Section */}
                        {costBreakdownEnabled ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Material Cost
                                        </label>
                                        <input
                                            type="number"
                                            name="material_cost"
                                            step="0.01"
                                            required
                                            value={materialCost || ""}
                                            onChange={(e) => setMaterialCost(parseFloat(e.target.value) || 0)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Operation, Overhead & Profit
                                        </label>
                                        <input
                                            type="number"
                                            name="operation_cost"
                                            step="0.01"
                                            required
                                            value={operationCost || ""}
                                            onChange={(e) => setOperationCost(parseFloat(e.target.value) || 0)}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700">Your Price</span>
                                        <span className="text-2xl font-bold text-gray-900">
                                            ₹{totalPrice.toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">(INR per piece)</p>
                                </div>
                                <input type="hidden" name="unit_price" value={totalPrice} />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Price
                                </label>
                                <input
                                    type="number"
                                    name="unit_price"
                                    step="0.01"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                                    placeholder="0.00"
                                />
                                <p className="text-xs text-gray-500 mt-1">(INR per piece)</p>
                            </div>
                        )}

                        {/* Delivery Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Delivery Time (in days)
                            </label>
                            <input
                                type="number"
                                name="delivery_time"
                                required
                                min="1"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g., 15"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Note (optional)
                            </label>
                            <textarea
                                name="notes"
                                rows={4}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="Any additional comments or clarifications..."
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Attach File (optional)
                            </label>
                            <input
                                type="file"
                                name="file"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        {/* Mandatory Checkboxes */}
                        <div className="space-y-3 border-t pt-6">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="terms_accepted"
                                    required
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                    I agree to the terms and conditions.
                                </span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="commitment_accepted"
                                    required
                                    checked={commitmentAccepted}
                                    onChange={(e) => setCommitmentAccepted(e.target.checked)}
                                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">
                                    If PO is issued, I will start work the same day and dispatch within the agreed lead time.
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <SubmitButton />
                    </form>
                </div>
            </div>
        </div>
    );
}
