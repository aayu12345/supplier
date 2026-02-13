"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Send, CheckCircle, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";

type RFQ = {
    id: string;
    rfq_number: string;
    file_name: string;
    quantity: number | string;
    lead_time: string;
    target_price?: number;
    notes?: string;
    status: string;
    admin_status: string;
    quote_price?: number;
    quote_lead_time?: string;
    quote_valid_until?: string;
    created_at: string;
};

type Negotiation = {
    id: string;
    rfq_id: string;
    sender_role: "buyer" | "admin";
    price: number | null;
    notes: string;
    created_at: string;
};

export default function BuyerNegotiationPage() {
    const params = useParams();
    const router = useRouter();
    const rfqId = params.id as string;

    const [rfq, setRfq] = useState<RFQ | null>(null);
    const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        fetchData();
    }, [rfqId]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch RFQ details
            const { data: rfqData, error: rfqError } = await supabase
                .from("rfqs")
                .select("*")
                .eq("id", rfqId)
                .single();

            if (rfqError) throw rfqError;
            setRfq(rfqData);

            // Fetch negotiations
            const { data: negData, error: negError } = await supabase
                .from("rfq_negotiations")
                .select("*")
                .eq("rfq_id", rfqId)
                .order("created_at", { ascending: true });

            if (negError) throw negError;
            setNegotiations(negData || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmitMessage = async (data: any) => {
        try {
            const { error } = await supabase
                .from("rfq_negotiations")
                .insert({
                    rfq_id: rfqId,
                    sender_role: "buyer",
                    price: data.price ? Number(data.price) : null,
                    notes: data.notes
                });

            if (error) throw error;

            // Refresh negotiations
            fetchData();
            reset();
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message");
        }
    };

    const handleAcceptOffer = async () => {
        try {
            const { approveQuote } = await import("@/app/dashboard/buyer/actions");
            const result = await approveQuote(rfqId);

            if (result?.error) {
                alert(result.error);
            } else {
                alert("Quote accepted! Redirecting...");
                router.push("/dashboard/buyer/quotes");
            }
        } catch (error) {
            console.error("Error accepting offer:", error);
            alert("Failed to accept offer");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!rfq) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <div className="max-w-5xl mx-auto text-center">
                    <p className="text-gray-500">RFQ not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push("/dashboard/buyer/quotes?tab=Negotiation")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Negotiation
                    </button>
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">{rfq.rfq_number}</h1>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                            {rfq.status}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: Quote Details */}
                    <div className="lg:col-span-1 space-y-4">

                        {/* RFQ Details Card */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">RFQ Details</h3>

                            <div className="flex items-start gap-3 mb-4">
                                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                                <span className="text-blue-600 font-medium text-sm">{rfq.file_name}</span>
                            </div>

                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-500">Quantity:</p>
                                    <p className="font-semibold text-gray-900">{rfq.quantity}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Target Price:</p>
                                    <p className="font-semibold text-gray-900">₹{rfq.target_price?.toFixed(2) || 'N/A'} ea</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Lead Time:</p>
                                    <p className="font-semibold text-gray-900">{rfq.lead_time}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Requirements:</p>
                                    <p className="font-semibold text-gray-900">{rfq.notes || 'No special requirements'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Current Offer Card */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100 ring-1 ring-blue-50">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Current Offer</h3>

                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-3xl font-bold text-gray-900">₹{rfq.quote_price?.toFixed(2)}</span>
                                <span className="text-lg text-gray-500 font-medium">ea</span>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Lead Time:</span>
                                    <span className="font-medium text-gray-900">{rfq.quote_lead_time}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Valid Until:</span>
                                    <span className="font-medium text-gray-900">{rfq.quote_valid_until}</span>
                                </div>
                            </div>

                            {/* Accept Button */}
                            <button
                                onClick={handleAcceptOffer}
                                className="w-full mt-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="h-5 w-5" />
                                Accept Offer
                            </button>
                        </div>
                    </div>

                    {/* Right: Negotiation Chat */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">

                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900">Negotiation Chat</h3>
                                <p className="text-sm text-gray-500">Discuss price, quality, quantity, material, etc.</p>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {negotiations.length === 0 ? (
                                    <div className="text-center text-gray-400 py-8">
                                        <p>No messages yet. Start the negotiation!</p>
                                    </div>
                                ) : (
                                    negotiations.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.sender_role === 'buyer' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-lg p-4 ${msg.sender_role === 'buyer'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-900'
                                                    }`}
                                            >
                                                <p className="text-xs font-bold mb-1 opacity-75">
                                                    {msg.sender_role === 'buyer' ? 'You' : 'Admin'}
                                                </p>
                                                {msg.price && (
                                                    <p className="text-lg font-bold mb-2">₹{msg.price.toFixed(2)}</p>
                                                )}
                                                <p className="text-sm">{msg.notes}</p>
                                                <p className="text-xs mt-2 opacity-60">
                                                    {new Date(msg.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Message Input */}
                            <form onSubmit={handleSubmit(onSubmitMessage)} className="p-4 border-t border-gray-200">
                                <div className="space-y-3">
                                    <input
                                        {...register("price")}
                                        type="number"
                                        step="0.01"
                                        placeholder="Your counter-offer (₹) - optional"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <div className="flex gap-2">
                                        <textarea
                                            {...register("notes", { required: true })}
                                            placeholder="Type your message... (discuss quality, quantity, material, price)"
                                            rows={2}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button
                                            type="submit"
                                            className="px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                        >
                                            <Send className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
