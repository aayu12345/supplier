"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Building2,
    FileText,
    History,
    StickyNote,
    Award,
    Wrench,
    Mail,
    Phone,
    MapPin,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    Download,
} from "lucide-react";
import Link from "next/link";

type SupplierProfile = {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    company_name: string;
    gst_number: string;
    msme_number: string;
    address: string;
    created_at: string;
};

type Quote = {
    id: string;
    rfq_id: string;
    rfq_number: string;
    quoted_price: number;
    status: string;
    created_at: string;
};

type Document = {
    id: string;
    type: string;
    file_url: string;
    uploaded_at: string;
};

export default function SupplierDetailPage() {
    const params = useParams();
    const router = useRouter();
    const supplierId = params.id as string;

    const [activeTab, setActiveTab] = useState("company");
    const [supplier, setSupplier] = useState<SupplierProfile | null>(null);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [trustScore, setTrustScore] = useState(0);
    const [capabilities, setCapabilities] = useState<string[]>([]);
    const [adminNotes, setAdminNotes] = useState("");
    const [loading, setLoading] = useState(true);
    const [savingNotes, setSavingNotes] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        fetchSupplierData();
    }, [supplierId]);

    const fetchSupplierData = async () => {
        setLoading(true);
        try {
            // Fetch supplier profile
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", supplierId)
                .single();

            if (profile) {
                setSupplier(profile as any);
                setCapabilities((profile as any).capabilities || []);
            }

            // Fetch quotes history from existing supplier_quotes table
            const { data: quotesData } = await supabase
                .from("supplier_quotes")
                .select(`
                    id,
                    quoted_price,
                    status,
                    created_at,
                    rfq_id
                `)
                .eq("supplier_id", supplierId)
                .order("created_at", { ascending: false });

            if (quotesData) {
                // Fetch RFQ numbers for each quote
                const quotesWithRFQ = await Promise.all(
                    quotesData.map(async (q: any) => {
                        const { data: rfqData } = await supabase
                            .from("rfqs")
                            .select("rfq_number")
                            .eq("id", q.rfq_id)
                            .single();

                        return {
                            id: q.id,
                            rfq_id: q.rfq_id,
                            rfq_number: rfqData?.rfq_number || "N/A",
                            quoted_price: q.quoted_price,
                            status: q.status,
                            created_at: q.created_at,
                        };
                    })
                );
                setQuotes(quotesWithRFQ);
            }

            // Fetch trust score from existing supplier_metrics table
            const { data: metrics } = await supabase
                .from("supplier_metrics")
                .select("trust_score")
                .eq("id", supplierId)
                .single();

            if (metrics) {
                setTrustScore(metrics.trust_score || 0);
            }

            // Fetch documents from existing supplier_documents table
            // Note: existing table has document_type, document_url, document_name
            const { data: docsData } = await supabase
                .from("supplier_documents")
                .select("*")
                .eq("supplier_id", supplierId);

            if (docsData) {
                // Map existing structure to our component's expected structure
                setDocuments(
                    docsData.map((doc: any) => ({
                        id: doc.id,
                        type: doc.document_type,
                        file_url: doc.document_url,
                        uploaded_at: doc.uploaded_at,
                    }))
                );
            }

            // Fetch admin notes from new supplier_admin_notes table
            const { data: notesData } = await supabase
                .from("supplier_admin_notes")
                .select("notes")
                .eq("supplier_id", supplierId)
                .single();

            if (notesData) {
                setAdminNotes(notesData.notes || "");
            }
        } catch (err) {
            console.error("Error fetching supplier data:", err);
        } finally {
            setLoading(false);
        }
    };

    const saveAdminNotes = async () => {
        setSavingNotes(true);
        try {
            const { error } = await supabase
                .from("supplier_admin_notes")
                .upsert({
                    supplier_id: supplierId,
                    notes: adminNotes,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
            alert("Notes saved successfully!");
        } catch (err) {
            console.error("Error saving notes:", err);
            alert("Failed to save notes");
        } finally {
            setSavingNotes(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
            Accepted: "bg-green-100 text-green-700 border-green-200",
            Rejected: "bg-red-100 text-red-700 border-red-200",
        };
        return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700 border-gray-200";
    };

    const getTrustScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 50) return "text-yellow-600";
        return "text-red-600";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading supplier details...</p>
                </div>
            </div>
        );
    }

    if (!supplier) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Supplier not found</p>
                    <Link href="/admin/suppliers" className="text-blue-600 hover:underline mt-4 inline-block">
                        ← Back to Suppliers
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/admin/suppliers"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Suppliers
                    </Link>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                    {supplier.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
                                    <p className="text-gray-500">{supplier.company_name || "Company Name N/A"}</p>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <Mail className="h-4 w-4" />
                                            {supplier.email}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Phone className="h-4 w-4" />
                                            {supplier.phone}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            {supplier.city}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Score Badge */}
                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 px-6 py-4 rounded-xl border border-yellow-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <Award className="h-5 w-5 text-yellow-600" />
                                    <span className="text-sm font-medium text-gray-600">Trust Score</span>
                                </div>
                                <div className={`text-4xl font-bold ${getTrustScoreColor(trustScore)}`}>
                                    {trustScore}
                                    <span className="text-lg text-gray-400">/100</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Tab Headers */}
                    <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                        <div className="flex overflow-x-auto">
                            {[
                                { id: "company", label: "Company Info", icon: Building2 },
                                { id: "documents", label: "Documents", icon: FileText },
                                { id: "history", label: "Quoting History", icon: History },
                                { id: "notes", label: "Admin Notes", icon: StickyNote },
                                { id: "trust", label: "Trust Score", icon: Award },
                                { id: "capabilities", label: "Capabilities", icon: Wrench },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                                        ? "border-blue-600 text-blue-600 bg-white"
                                        : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Company Info Tab */}
                        {activeTab === "company" && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Company Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="text-sm font-medium text-gray-600">Company Name</label>
                                        <p className="text-lg font-semibold text-gray-900 mt-1">
                                            {supplier.company_name || "N/A"}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="text-sm font-medium text-gray-600">GST Number</label>
                                        <p className="text-lg font-semibold text-gray-900 mt-1">
                                            {supplier.gst_number || "N/A"}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="text-sm font-medium text-gray-600">MSME Number</label>
                                        <p className="text-lg font-semibold text-gray-900 mt-1">
                                            {supplier.msme_number || "N/A"}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="text-sm font-medium text-gray-600">City</label>
                                        <p className="text-lg font-semibold text-gray-900 mt-1">{supplier.city}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                                        <label className="text-sm font-medium text-gray-600">Address</label>
                                        <p className="text-lg font-semibold text-gray-900 mt-1">
                                            {supplier.address || "N/A"}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="text-sm font-medium text-gray-600">Registered Since</label>
                                        <p className="text-lg font-semibold text-gray-900 mt-1">
                                            {new Date(supplier.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Documents Tab */}
                        {activeTab === "documents" && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Uploaded Documents</h2>
                                {documents.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No documents uploaded yet</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-8 w-8 text-blue-600" />
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{doc.type}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(doc.uploaded_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={doc.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quoting History Tab */}
                        {activeTab === "history" && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Quoting History</h2>
                                {quotes.length === 0 ? (
                                    <div className="text-center py-12">
                                        <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No quotes submitted yet</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b-2 border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                                                        RFQ Number
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                                                        Quoted Price
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                                                        Date
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {quotes.map((quote) => (
                                                    <tr key={quote.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 font-medium text-gray-900">
                                                            {quote.rfq_number}
                                                        </td>
                                                        <td className="px-4 py-3 font-bold text-green-600">
                                                            ₹{quote.quoted_price?.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                                                                    quote.status
                                                                )}`}
                                                            >
                                                                {quote.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {new Date(quote.created_at).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Admin Notes Tab */}
                        {activeTab === "notes" && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Internal Admin Notes</h2>
                                <p className="text-sm text-gray-500 mb-4">
                                    These notes are only visible to admins and won't be shared with the supplier.
                                </p>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add internal notes about this supplier..."
                                    className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                />
                                <button
                                    onClick={saveAdminNotes}
                                    disabled={savingNotes}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait"
                                >
                                    {savingNotes ? "Saving..." : "Save Notes"}
                                </button>
                            </div>
                        )}

                        {/* Trust Score Tab */}
                        {activeTab === "trust" && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Trust Score Breakdown</h2>
                                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-xl border border-yellow-200 text-center">
                                    <Award className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                                    <div className={`text-6xl font-bold ${getTrustScoreColor(trustScore)} mb-2`}>
                                        {trustScore}
                                    </div>
                                    <p className="text-gray-600">Overall Trust Score</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                                        <p className="text-sm text-gray-600 mb-2">On-Time Delivery</p>
                                        <p className="text-2xl font-bold text-green-600">85%</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                                        <p className="text-sm text-gray-600 mb-2">Quality Rating</p>
                                        <p className="text-2xl font-bold text-blue-600">4.5/5</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                                        <p className="text-sm text-gray-600 mb-2">Response Time</p>
                                        <p className="text-2xl font-bold text-purple-600">2.3 hrs</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Capabilities Tab */}
                        {activeTab === "capabilities" && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Supplier Capabilities</h2>
                                {capabilities.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Wrench className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">No capabilities listed</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {capabilities.map((capability, index) => (
                                            <div
                                                key={index}
                                                className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg flex items-center gap-2"
                                            >
                                                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                                <span className="font-medium text-gray-900">{capability}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
