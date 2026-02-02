"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Upload, FileText, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

type OrderDetail = {
    id: string;
    order_number: string;
    status: string;
    currency: string;
    total_value: number;
    po_url?: string;
    pi_url?: string;
    final_quote_url?: string;
    created_at: string;
    rfqs: {
        rfq_number: string;
        file_name: string;
    };
    profiles: {
        name: string;
        company_name: string;
        email: string;
        phone: string;
    };
};

type TimelineItem = {
    id: string;
    title: string;
    description: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    visible_to_buyer: boolean;
    step_date: string;
    created_at: string;
};

export default function AdminOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) fetchData();
    }, [params.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Order
            const { data: orderData, error: orderError } = await supabase
                .from("orders")
                .select(`
                    *,
                    rfqs:rfq_id (rfq_number, file_name),
                    profiles:buyer_id (name, company_name, email, phone)
                `)
                .eq("id", params.id)
                .single();

            if (orderError) throw orderError;
            setOrder(orderData as any);

            // 2. Fetch Timeline
            const { data: timelineData } = await supabase
                .from("order_timeline")
                .select("*")
                .eq("order_id", params.id)
                .order("step_date", { ascending: true }); // Chronological

            if (timelineData) setTimeline(timelineData as any);

        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkCompleted = async () => {
        if (!confirm("Mark this order as Completed?")) return;
        const { error } = await supabase
            .from("orders")
            .update({ status: 'Completed', completed_at: new Date().toISOString() })
            .eq("id", params.id);

        if (!error) {
            alert("Order Completed!");
            fetchData();
        }
    };

    const handleUploadDoc = async (field: 'po_url' | 'pi_url' | 'final_quote_url') => {
        // Mock upload for now - in production this would be a file picker + storage upload
        const url = prompt(`Enter URL for ${field.replace('_url', '').toUpperCase()} (or "mock"):`, "https://example.com/doc.pdf");
        if (!url) return;

        const { error } = await supabase
            .from("orders")
            .update({ [field]: url })
            .eq("id", params.id);

        if (error) alert("Error uploading: " + error.message);
        else {
            // Trigger Payment Record Creation if PI is uploaded
            if (field === 'pi_url') {
                const initPayment = confirm("Do you want to initialize the Payment Record for this PI?");
                if (initPayment) {
                    const total = Number(prompt("Confirm Total Order Value (USD):", order?.total_value?.toString()));
                    const advancePct = Number(prompt("Advance Percentage (%):", "50"));
                    const dueDate = prompt("Advance Payment Due Date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);

                    if (total && advancePct && dueDate) {
                        const { error: payError } = await supabase.from("order_payments").insert({
                            order_id: params.id,
                            total_amount: total,
                            currency: order?.currency || 'USD',
                            advance_percentage: advancePct,
                            advance_due_date: dueDate
                        });

                        if (payError) alert("Failed to create Payment Record: " + payError.message);
                        else alert("Payment Record Initialized! Check Payments Dashboard.");
                    }
                }
            }
            fetchData();
        }
    };

    const handleTimelineAction = async (itemId: string, newStatus: string) => {
        const { error } = await supabase
            .from("order_timeline")
            .update({ status: newStatus, visible_to_buyer: newStatus === 'Approved' })
            .eq("id", itemId);

        if (error) alert("Error: " + error.message);
        else fetchData();
    };

    const handleAddTimelineStep = async () => {
        const title = prompt("Step Title (e.g. Material Arrived):");
        if (!title) return;
        const desc = prompt("Description:");

        const { error } = await supabase.from("order_timeline").insert({
            order_id: params.id,
            title,
            description: desc || "",
            status: 'Approved', // Auto-approve admin's own posts
            visible_to_buyer: true
        });

        if (error) alert("Error: " + error.message);
        else fetchData();
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!order) return <div className="p-8">Order Not Found</div>;

    return (
        <div className="max-w-6xl mx-auto pb-24 space-y-8">
            {/* Header */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between sticky top-4 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/admin/buyers/orders" className="text-gray-500 hover:text-blue-600">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {order.order_number}
                            <span className="text-sm font-normal text-gray-500">for {order.profiles?.company_name}</span>
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-50 text-blue-600 border border-blue-200">
                        {order.status}
                    </span>
                    {order.status !== 'Completed' && (
                        <button onClick={handleMarkCompleted} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 shadow-sm">
                            Mark as Completed
                        </button>
                    )}
                </div>
            </div>

            {/* Section 1: Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-400" /> Order Details
                    </h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">RFQ Number</span>
                            <span className="font-medium">{order.rfqs?.rfq_number}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Buyer</span>
                            <span className="font-medium">{order.profiles?.name}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Total Value</span>
                            <span className="font-bold text-green-700">
                                {order.currency} {(order.total_value || 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Date Created</span>
                            <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Section 2: File Hub (Simplified Placeholder) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Upload className="h-5 w-5 text-gray-400" /> Documents
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <DocumentCard label="Buyer PO" url={order.po_url} onUpload={() => handleUploadDoc('po_url')} />
                        <DocumentCard label="Proforma Invoice" url={order.pi_url} onUpload={() => handleUploadDoc('pi_url')} />
                        <DocumentCard label="Final Quote" url={order.final_quote_url} onUpload={() => handleUploadDoc('final_quote_url')} />
                    </div>
                </div>
            </div>

            {/* Section 3: Timeline */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-400" /> Production Timeline
                    </h2>
                    <button onClick={handleAddTimelineStep} className="text-sm text-blue-600 font-medium hover:underline">
                        + Add Update
                    </button>
                </div>

                <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 pl-8 py-2">
                    {timeline.length === 0 ? (
                        <p className="text-gray-400 text-sm italic">No timeline updates yet.</p>
                    ) : timeline.map((step) => (
                        <div key={step.id} className="relative">
                            <span className={`absolute -left-[41px] top-1 h-5 w-5 rounded-full border-2 bg-white ${step.status === 'Approved' ? 'border-green-500 bg-green-50' : 'border-gray-300'
                                }`} />

                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-900">{step.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                                    <p className="text-xs text-gray-400 mt-2">{new Date(step.step_date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${step.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                        step.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {step.status}
                                    </span>
                                    {step.status === 'Pending' && (
                                        <div className="flex gap-2 mt-2">
                                            <button onClick={() => handleTimelineAction(step.id, 'Approved')} className="text-xs text-green-600 hover:underline">Approve</button>
                                            <button onClick={() => handleTimelineAction(step.id, 'Rejected')} className="text-xs text-red-600 hover:underline">Reject</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function DocumentCard({ label, url, onUpload }: { label: string, url?: string, onUpload: () => void }) {
    return (
        <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-between group hover:border-blue-200 transition-colors">
            <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
                {url ? (
                    <a href={url} target="_blank" className="text-sm text-blue-600 hover:underline truncate block max-w-[100px]">View File</a>
                ) : (
                    <button onClick={onUpload} className="text-sm text-gray-400 italic hover:text-blue-500 flex items-center gap-1">
                        <Upload className="h-3 w-3" /> Upload
                    </button>
                )}
            </div>
            {url && <CheckCircle className="h-4 w-4 text-green-500" />}
        </div>
    );
}
