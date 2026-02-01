import { FileText, Download } from "lucide-react";
import { RFQ } from "./OrdersTable";

export default function OrderSummary({ order }: { order: RFQ }) {
    return (
        <div className="space-y-6">
            {/* Project Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Project Details</h3>

                <div className="space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Buyer RFQ</p>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700 truncate">{order.file_name}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Quantity</p>
                            <p className="text-sm font-bold text-gray-900">{order.quantity || '—'} pcs</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target Lead Time</p>
                            <p className="text-sm font-bold text-gray-900">{order.lead_time || '—'}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shipping Details</p>
                        <div className="text-sm text-gray-700 space-y-1">
                            <p className="font-bold">{order.contact_name || 'N/A'}</p>
                            {order.company_name && <p className="text-gray-600">{order.company_name}</p>}
                            <p>{order.contact_email}</p>
                            {order.contact_phone && <p>{order.contact_phone}</p>}
                            {order.shipping_address && <p className="mt-2 text-gray-500 text-xs">{order.shipping_address}</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Documentation</h3>
                <div className="space-y-3">

                    {/* PO */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                                <FileText className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Purchase Order</p>
                                <p className="text-xs text-gray-500">Provided by You</p>
                            </div>
                        </div>
                        {order.po_file_url ? (
                            <a href={order.po_file_url} target="_blank" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</a>
                        ) : (
                            <span className="text-xs text-yellow-600 font-medium">Pending</span>
                        )}
                    </div>

                    {/* Proforma (Mock for now) */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                <FileText className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Proforma Invoice</p>
                                <p className="text-xs text-gray-500">From TheSupplier</p>
                            </div>
                        </div>
                        <button disabled className="text-gray-400 text-sm font-medium cursor-not-allowed">Generating...</button>
                    </div>

                </div>
            </div>
        </div>
    );
}
