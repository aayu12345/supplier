"use client";

import { X, FileText, Calendar, CheckCircle, MessageSquare } from "lucide-react";
import { type RFQ } from "./QuotesTable";

interface QuoteDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    quote: RFQ;
}

export default function QuoteDetailModal({ isOpen, onClose, quote }: QuoteDetailModalProps) {
    if (!isOpen) return null;

    const handleAccept = async () => {
        // Call Server Action
        const { approveQuote } = await import("@/app/dashboard/buyer/actions");
        const result = await approveQuote(quote.id);

        if (result?.error) {
            alert(result.error);
        } else {
            alert("Thank you for your order. Please email your PO to sales@TheSupplier.in or upload in your 'My Orders' section.");
            onClose();
            // Ideally trigger a refresh of the parent list here if needed, 
            // but revalidatePath in action handles server data. 
            // For client state update, a full page reload or context refresh is needed 
            // if we want instant 'removal' from the list without reload.
            window.location.reload(); // Simple refresh to show updated list
        }
    };

    const handleNegotiate = () => {
        alert("Negotiation request sent to Admin.");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex-none flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">View Quote</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* RFQ Details Card */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">RFQ Details</h3>

                        <div className="flex items-start gap-3 mb-4">
                            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                            <span className="text-blue-600 font-medium hover:underline cursor-pointer">{quote.file_name}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Quantity:</p>
                                <p className="font-semibold text-gray-900">{quote.quantity}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Target Price:</p>
                                <p className="font-semibold text-gray-900">$25.00 ea</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Lead Time:</p>
                                <p className="font-semibold text-gray-900">{quote.lead_time}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Requirements:</p>
                                <p className="font-semibold text-gray-900">Expedited delivery</p>
                            </div>
                        </div>
                    </div>

                    {/* Our Offer Card */}
                    <div className="bg-white rounded-xl p-5 border border-blue-100 shadow-sm ring-1 ring-blue-50">
                        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Our Offer</h3>

                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-3xl font-bold text-gray-900">${quote.quote_price?.toFixed(2)}</span>
                            <span className="text-lg text-gray-500 font-medium">ea</span>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Lead Time:</span>
                                <span className="font-medium text-gray-900">{quote.quote_lead_time}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Valid Until:</span>
                                <span className="font-medium text-gray-900">{quote.quote_valid_until}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="flex-none p-6 border-t border-gray-100 flex gap-3 bg-white rounded-b-2xl">
                    <button
                        onClick={handleNegotiate}
                        className="flex-1 py-3 bg-white border border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        Negotiate
                    </button>

                    <button
                        onClick={handleAccept}
                        className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                        Accept
                    </button>
                </div>

            </div>
        </div>
    );
}
