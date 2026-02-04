"use client";

import { X, Calendar, Info, FileText } from "lucide-react";
import { useState } from "react";
import FileUploadZone from "@/components/ui/FileUploadZone";
import { useRouter } from "next/navigation";

interface RFQUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoggedIn?: boolean;
}

export default function RFQUploadModal({ isOpen, onClose, isLoggedIn = true }: RFQUploadModalProps) {
    const [rfqType, setRfqType] = useState<"single" | "multiple">("single");
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    type RFQItem = {
        drawing_number: string;
        quantity: string;
        target_price: string;
        lead_time: string;
        file: File | null;
    };

    const [items, setItems] = useState<RFQItem[]>([
        { drawing_number: "", quantity: "", target_price: "", lead_time: "", file: null }
    ]);

    const addItem = () => {
        setItems([...items, { drawing_number: "", quantity: "", target_price: "", lead_time: "", file: null }]);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const updateItem = (index: number, field: keyof RFQItem, value: any) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        setItems(newItems);
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rfqType === "single" && !file) {
            alert("Please upload a drawing file.");
            return;
        }

        if (rfqType === "multiple") {
            // Validate that at least one item exists
            if (items.length === 0) {
                alert("Please add at least one item.");
                return;
            }
            // Optional: Validate that items have files?
            // const missingFiles = items.filter(i => !i.file);
            // if (missingFiles.length > 0) { alert("Please upload drawings for all items."); return; }
        }

        setIsSubmitting(true);

        try {
            const form = e.target as HTMLFormElement;
            const data = new FormData(form);

            if (file) {
                data.set("file", file);
            }
            data.set("type", rfqType);

            if (rfqType === "multiple") {
                // Strip files from JSON to act as metadata
                const itemsMeta = items.map(item => ({
                    drawing_number: item.drawing_number,
                    quantity: item.quantity,
                    target_price: item.target_price,
                    lead_time: item.lead_time
                }));
                data.set("items", JSON.stringify(itemsMeta));

                // Append files separately
                items.forEach((item, index) => {
                    if (item.file) {
                        data.append(`item_file_${index}`, item.file);
                    }
                });
            }

            // Call Server Action
            const { submitRFQ } = await import("@/app/dashboard/buyer/actions");
            const result = await submitRFQ(data);

            if (result?.error) {
                alert(result.error);
            } else if (result?.success) {
                if (result.newAccount) {
                    // Show password for new guest users
                    alert(`Request Submitted!\n\nIMPORTANT: We created an account for you.\nEmail: ${result.newAccount.email}\nPassword: ${result.newAccount.password} (Your Phone Number)\n\nYou can verify your account and change this password later in Settings.`);
                } else {
                    alert("Thank you! Your RFQ has been submitted. You can track it from the Quotes section.");
                }

                onClose();
                router.push("/dashboard/buyer/quotes");
            }
        } catch (error) {
            alert("An unexpected error occurred. Please try again.");
            console.error(error);
        } finally {
            setIsSubmitting(false);
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
                        disabled={isSubmitting}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Section 1: File Upload (Only for Single Type) */}
                    {rfqType === "single" && (
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                                    1. Upload Drawing <span className="text-red-500">*</span>
                                </h3>
                            </div>
                            <FileUploadZone onFileSelect={setFile} selectedFile={file} />
                        </section>
                    )}

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
                    <section className="space-y-6">
                        {rfqType === "single" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        Lead Time (Optional)
                                    </label>
                                    <input
                                        name="lead_time"
                                        type="date"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

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
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-900 uppercase">3. ITEMS</h4>
                                {items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 relative group">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Drawing #</label>
                                            <input
                                                type="text"
                                                placeholder="DWG-001"
                                                value={item.drawing_number}
                                                onChange={(e) => updateItem(index, "drawing_number", e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
                                            <input
                                                type="number"
                                                placeholder="100"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Target Price</label>
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                                                <input
                                                    type="number"
                                                    placeholder="2.50"
                                                    value={item.target_price}
                                                    onChange={(e) => updateItem(index, "target_price", e.target.value)}
                                                    className="w-full pl-5 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Lead Time</label>
                                            <input
                                                type="date"
                                                value={item.lead_time}
                                                onChange={(e) => updateItem(index, "lead_time", e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                            />
                                        </div>

                                        {/* Item File Upload */}
                                        <div className="md:col-span-4 flex items-center gap-2">
                                            <label className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md cursor-pointer transition-colors text-xs font-medium border border-gray-200">
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) updateItem(index, "file", file);
                                                    }}
                                                />
                                                {item.file ? (
                                                    <span className="text-blue-600 flex items-center gap-1">
                                                        <FileText className="h-3 w-3" />
                                                        {item.file.name}
                                                    </span>
                                                ) : (
                                                    <>
                                                        <span className="h-4 w-4 flex items-center justify-center border border-gray-400 rounded-sm">
                                                            <span className="text-[10px]">+</span>
                                                        </span>
                                                        Upload Drawing
                                                    </>
                                                )}
                                            </label>
                                            {item.file && (
                                                <button
                                                    type="button"
                                                    onClick={() => updateItem(index, "file", null)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>

                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="absolute -top-2 -right-2 bg-white text-red-500 border border-gray-200 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
                                >
                                    + Add More Item
                                </button>
                            </div>
                        )}

                        <div>
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

                    {/* Footer - With Loading State */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting && (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {isSubmitting ? "Submitting..." : "Submit Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
