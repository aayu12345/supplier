"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Download, Calendar, Box, DollarSign, Clock, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import UpdateOrderModal from "@/components/dashboard/supplier/UpdateOrderModal";

const supabase = createClient();

export default function SupplierOrderDetailPage() {
    const params = useParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (params.id) fetchOrderDetail();
    }, [params.id]);

    const fetchOrderDetail = async () => {
        const { data, error } = await supabase
            .from("orders")
            .select(`
                *,
                rfqs (
                    rfq_number,
                    file_name,
                    file_url,
                    material_admin,
                    quantity,
                    lead_time_admin,
                    admin_notes
                ),
                order_timeline (
                    stage,
                    description,
                    status,
                    attachment_url,
                    created_at
                )
            `)
            .eq("id", params.id)
            .single();

        if (error) console.error(error);
        else setOrder(data);
        setLoading(false);
    };

    if (loading) return <div className="p-12 text-center">Loading order details...</div>;
    if (!order) return <div className="p-12 text-center text-red-500">Order not found</div>;

    // Timeline sorted reverse chronologically
    const timeline = order.order_timeline?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            {/* Nav */}
            <Link href="/dashboard/supplier/orders" className="flex items-center text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to My Orders
            </Link>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Order #{order.order_number}</h1>
                    <p className="text-gray-500 mt-1">RFQ Ref: {order.rfqs.rfq_number}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary"
                    >
                        + Update Progress
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: Info & Docs */}
                <div className="space-y-6">
                    {/* Order Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Box className="h-5 w-5 text-gray-400" />
                            Order Details
                        </h2>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500">Material</span>
                                <span className="font-medium text-gray-900">{order.rfqs.material_admin}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500">Quantity</span>
                                <span className="font-medium text-gray-900">{order.rfqs.quantity} Units</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500">Total Value</span>
                                <span className="font-medium text-gray-900">₹ {order.total_value.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-500">Lead Time</span>
                                <span className="font-medium text-gray-900">{order.rfqs.lead_time_admin} Days</span>
                            </div>
                        </div>
                    </div>

                    {/* Documents Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-400" />
                            Documents
                        </h2>
                        <div className="space-y-3">
                            {order.pi_url && (
                                <a href={order.pi_url} target="_blank" className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                                    <Download className="h-5 w-5" />
                                    <div className="text-sm">
                                        <p className="font-medium">Performa Invoice</p>
                                        <p className="text-xs opacity-75">Uploaded by You</p>
                                    </div>
                                </a>
                            )}
                            {order.po_url ? (
                                <a href={order.po_url} target="_blank" className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                                    <Download className="h-5 w-5" />
                                    <div className="text-sm">
                                        <p className="font-medium">Purchase Order</p>
                                        <p className="text-xs opacity-75">From Buyer/Admin</p>
                                    </div>
                                </a>
                            ) : (
                                <div className="p-3 bg-gray-50 text-gray-400 rounded-lg text-sm text-center">
                                    Purchase Order Pending
                                </div>
                            )}

                            {order.rfqs.file_url && (
                                <a href={order.rfqs.file_url} target="_blank" className="flex items-center gap-3 p-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                                    <Download className="h-5 w-5" />
                                    <div className="text-sm">
                                        <p className="font-medium">Production Drawing</p>
                                        <p className="text-xs opacity-75">Original RFQ File</p>
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Ad Placeholder */}
                    <div className="bg-white border rounded-lg p-4 flex flex-col items-center justify-center h-48 text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-100">
                        <span className="font-bold text-gray-800">Vertical Ad</span>
                        <span className="text-xs text-gray-500 mt-1">300 x 250</span>
                    </div>
                </div>

                {/* RIGHT: Timeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Production Timeline</h2>

                        <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pl-8 pb-4">

                            {/* Latest Updates */}
                            {timeline.map((item: any, idx: number) => (
                                <div key={idx} className="relative">
                                    {/* Dot */}
                                    <div className={`absolute -left-[41px] top-0 h-6 w-6 rounded-full border-4 border-white ${item.status === 'Approved' ? 'bg-green-500' : 'bg-blue-500'} shadow-sm`} />

                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1">
                                        <h3 className="font-bold text-gray-900">{item.stage}</h3>
                                        <span className="text-xs text-gray-500 flex items-center bg-gray-100 px-2 py-1 rounded">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {new Date(item.created_at).toLocaleString()}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-3">{item.description}</p>

                                    {item.attachment_url && (
                                        <a href={item.attachment_url} target="_blank" className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100">
                                            <Download className="h-3 w-3" />
                                            View Attachment
                                        </a>
                                    )}

                                    {item.status === 'Pending' && (
                                        <div className="mt-2 inline-flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Pending Approval
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Start Point */}
                            <div className="relative">
                                <div className="absolute -left-[41px] top-0 h-6 w-6 rounded-full border-4 border-white bg-gray-300 shadow-sm" />
                                <h3 className="font-bold text-gray-400">Order Placed</h3>
                                <p className="text-sm text-gray-400 mt-1">
                                    {new Date(order.created_at).toLocaleString()}
                                </p>
                            </div>

                        </div>
                    </div>

                    {/* Bottom Ad */}
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-center justify-between px-6">
                        <span className="font-bold text-gray-800">Ad</span>
                        <span className="text-sm text-gray-500">Advertisement • 728 x 90</span>
                        <span className="text-xs text-gray-400">Google</span>
                    </div>
                </div>
            </div>

            {/* Update Modal */}
            <UpdateOrderModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                orderId={order.id}
                orderNumber={order.order_number}
            />
        </div>
    );
}
