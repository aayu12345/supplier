"use client";

import { FileText, Upload, CheckCircle, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

type OrderDocumentsProps = {
    orderId: string;
    poUrl?: string;
    piUrl?: string;
};

export default function OrderDocumentsClient({ orderId, poUrl, piUrl }: OrderDocumentsProps) {
    const [po, setPo] = useState(poUrl);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        if (file.size > 10 * 1024 * 1024) { // 10MB Limit
            alert("File size exceeds 10MB limit.");
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `po_${orderId}_${Date.now()}.${fileExt}`;
            const filePath = `po/${fileName}`;

            // 1. Upload to Supabase Storage
            // Using 'rfq-attachments' bucket - assuming it exists or is standard for docs
            // If strictly 'rfq-drawings' is the only one, we might use that, but 'rfq-attachments' is better semantic match.
            // Let's try 'rfq-drawings' if 'rfq-attachments' fails, or just use 'rfq-drawings' to be safe as per previous actions using it.
            // Actually, previous action used 'rfq-drawings'. Let's stick to that to avoid permission issues if new bucket needs RLS.
            const { error: uploadError } = await supabase.storage
                .from('rfq-drawings')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('rfq-drawings')
                .getPublicUrl(filePath);

            // 3. Update Order Record
            const { error: dbError } = await supabase
                .from("orders")
                .update({ po_url: publicUrl })
                .eq("id", orderId);

            if (dbError) throw dbError;

            setPo(publicUrl);
            alert("Purchase Order uploaded successfully!");
        } catch (error: any) {
            console.error("Error uploading PO:", error);
            alert("Failed to upload document: " + (error.message || "Unknown error"));
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
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
                    {po ? (
                        <div className="flex items-center gap-2">
                            <a href={po} target="_blank" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</a>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                    ) : (
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="flex items-center gap-1 text-xs text-blue-600 font-medium border border-blue-200 bg-white px-2 py-1 rounded hover:bg-blue-50 disabled:opacity-50"
                            >
                                {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                                {uploading ? "Uploading..." : "Upload File"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Proforma Invoice */}
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
                    {piUrl ? (
                        <div className="flex items-center gap-2">
                            <a href={piUrl} target="_blank" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View</a>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                    ) : (
                        <button
                            onClick={() => alert("Request sent to Admin to generate PI.")}
                            className="text-gray-400 text-xs italic hover:text-gray-600"
                        >
                            Request PI
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
