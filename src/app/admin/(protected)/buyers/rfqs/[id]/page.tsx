"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Save, CheckCircle, CheckCircle2, AlertCircle, ShoppingCart, MessageSquare, Send } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

// Types matching DB
type AdminRFQDetail = {
    id: string;
    rfq_number: string;
    file_name: string;
    file_url?: string;
    quantity?: string;
    lead_time?: string; // Original buyer lead time
    target_price?: number; // Buyer's target
    description?: string; // Notes
    created_at: string;
    user_id: string; // FK to profiles
    admin_status: string; // 'New' | 'Live' | 'Quoted' | 'Sent to Buyer' | 'Approved' | 'Rejected'

    // Admin Fields
    weight_per_piece?: number;
    material_admin?: string;
    finish?: string;
    hardness?: string;
    lead_time_admin?: string;
    visibility_expires_at?: string;
    admin_notes?: string;

    // Quote & Order Fields
    quote_price?: number;
    quote_lead_time?: string;
    pi_url?: string;
    po_url?: string;

    profiles: {
        name: string;
        company_name: string;
        email: string;
        phone?: string;
    };
};

type SupplierQuote = {
    id: string;
    supplier_name: string;
    price: number;
    lead_time: string;
    remarks: string;
    status: string;
    created_at: string;
}

type NegotiationMessage = {
    id: string;
    sender_role: string;
    price: number;
    notes: string;
    created_at: string;
}

export default function AdminRFQDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [rfq, setRfq] = useState<AdminRFQDetail | null>(null);
    // ... (Imports remain same, add CheckCircle2 for drafted items)

    // Additional State for Parent View
    const [subRfqs, setSubRfqs] = useState<any[]>([]);
    const [rfqItems, setRfqItems] = useState<any[]>([]);
    const [isParent, setIsParent] = useState(false);

    // Existing State
    const [quotes, setQuotes] = useState<SupplierQuote[]>([]);
    const [negotiations, setNegotiations] = useState<NegotiationMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const supabase = createClient();

    // Forms
    const { register: registerLive, handleSubmit: handleSubmitLive, setValue: setValueLive } = useForm();
    const { register: registerNeg, handleSubmit: handleSubmitNeg, reset: resetNeg } = useForm();

    useEffect(() => {
        if (params.id) fetchData();
    }, [params.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Requesting RFQ
            const { data: rfqData, error: rfqError } = await supabase
                .from("rfqs")
                .select(`
                    *,
                    profiles:user_id (name, company_name, email, phone)
                `)
                .eq("id", params.id)
                .single();

            if (rfqError) throw rfqError;
            setRfq(rfqData as any);

            // 2. Determine Type & hierarchy
            // @ts-ignore
            if (!rfqData.parent_rfq_id) {
                // IT IS A PARENT (Likely)
                setIsParent(true);

                // Fetch Items (if any - mostly for Multiple type)
                const { data: items } = await supabase
                    .from("rfq_items")
                    .select("*")
                    .eq("rfq_id", params.id);

                let textItems = items || [];
                // If Single RFQ (no items table entries), treat the RFQ itself as the item source
                if (textItems.length === 0) {
                    textItems.push({
                        id: 'main-single', // Virtual ID
                        drawing_number: rfqData.drawing_number || rfqData.rfq_number, // Fallback if missing
                        quantity: rfqData.quantity,
                        target_price: rfqData.target_price,
                        file_url: rfqData.file_url,
                        file_name: rfqData.file_name,
                        lead_time: rfqData.lead_time
                    });
                }
                setRfqItems(textItems);

                // Fetch Sub-RFQs (Children)
                const { data: children } = await supabase
                    .from("rfqs")
                    .select("*")
                    // @ts-ignore
                    .eq("parent_rfq_id", params.id)
                    .order("created_at", { ascending: true });
                setSubRfqs(children || []);
            } else {
                // IT IS A SUB-RFQ
                setIsParent(false);

                // Fetch Quotes & Negotiations (Existing Logic)
                const { data: quoteData } = await supabase
                    .from("supplier_quotes")
                    .select("*")
                    .eq("rfq_id", params.id)
                    .order("price", { ascending: true });
                if (quoteData) setQuotes(quoteData);

                const { data: negData } = await supabase
                    .from("rfq_negotiations")
                    .select("*")
                    .eq("rfq_id", params.id)
                    .order("created_at", { ascending: true });
                if (negData) setNegotiations(negData);
            }

            // Pre-fill Forms (Existing Logic)
            if (rfqData) {
                setValueLive("weight_per_piece", rfqData.weight_per_piece || 0);
                // ... rest of pre-fill
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubRfq = async (item: any) => {
        if (!confirm(`Create Sub-RFQ for Item: ${item.drawing_number}?`)) return;
        setSaving(true);
        try {
            const { createSubRFQ } = await import("@/app/admin/actions");
            const result = await createSubRFQ(rfq!.id, {
                ...item,
                user_id: rfq!.user_id
            }, rfq!.rfq_number);

            if (result.error) throw new Error(result.error);
            alert("Sub-RFQ Created!");
            fetchData();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    // --- Actions ---

    const onSubmitLive = async (formData: any) => {
        if (!rfq) return;
        setSaving(true);
        try {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + Number(formData.visibility_days));

            const { error } = await supabase
                .from("rfqs")
                .update({
                    admin_status: 'Live',
                    weight_per_piece: formData.weight_per_piece,
                    material_admin: formData.material_admin,
                    finish: formData.finish,
                    hardness: formData.hardness,
                    lead_time_admin: formData.lead_time_admin,
                    admin_notes: formData.admin_notes,
                    visibility_expires_at: expiresAt.toISOString(),
                })
                .eq("id", rfq.id);

            if (error) throw error;

            // Check & Update Parent Status if applicable
            // @ts-ignore
            if (rfq.parent_rfq_id) {
                const { updateParentStatus } = await import("@/app/admin/actions");
                // @ts-ignore
                await updateParentStatus(rfq.parent_rfq_id);
            }

            alert("RFQ is now LIVE!");
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Error updating RFQ");
        } finally {
            setSaving(false);
        }
    };

    const handleMockQuote = async () => {
        if (!rfq) return;
        const price = prompt("Enter Mock Supplier Price:");
        if (!price) return;

        const { error } = await supabase.from("supplier_quotes").insert({
            rfq_id: rfq.id,
            supplier_name: "Mock Supplier " + Math.floor(Math.random() * 100),
            price: Number(price),
            lead_time: "10 Days",
            status: "Pending",
            remarks: "Generated for testing"
        });

        if (error) alert("Error: " + error.message);
        else {
            // Also update status to 'Quoted' if it was Live
            await supabase.from("rfqs").update({ admin_status: 'Quoted' }).eq("id", rfq.id);
            fetchData();
        }
    };

    const handleSendToBuyer = async (quote: SupplierQuote) => {
        if (!rfq) return;
        if (!confirm(`Send Quote of ${quote.price} to Buyer?`)) return;

        // 1. Update RFQ with selected price and status
        const { error } = await supabase
            .from("rfqs")
            .update({
                admin_status: 'Sent to Buyer',
                quote_price: quote.price,
                quote_lead_time: quote.lead_time
            })
            .eq("id", rfq.id);

        // 2. Add initial negotiation entry (Admin's offer)
        await supabase.from("rfq_negotiations").insert({
            rfq_id: rfq.id,
            sender_role: 'admin',
            price: quote.price,
            notes: `Initial offer sent to buyer based on ${quote.supplier_name}'s quote.`
        });

        if (error) alert("Error: " + error.message);
        else {
            alert("Quote Sent to Buyer!");
            fetchData();
        }
    };

    const onSubmitNegotiation = async (data: any) => {
        if (!rfq) return;
        // Admin sending a new counter offer
        const { error } = await supabase.from("rfq_negotiations").insert({
            rfq_id: rfq.id,
            sender_role: 'admin',
            price: Number(data.price),
            notes: data.notes
        });

        // Update main RFQ price too, stays 'Sent to Buyer'
        await supabase.from("rfqs").update({ quote_price: Number(data.price) }).eq("id", rfq.id);

        if (error) alert("Error sending message");
        else {
            resetNeg();
            fetchData();
        }
    };

    const handleExtendVisibility = async () => {
        if (!rfq) return;
        const days = prompt("Extend visibility by how many days?", "3");
        if (!days) return;

        const currentExpiry = rfq.visibility_expires_at ? new Date(rfq.visibility_expires_at) : new Date();
        currentExpiry.setDate(currentExpiry.getDate() + Number(days));

        const { error } = await supabase
            .from("rfqs")
            .update({ visibility_expires_at: currentExpiry.toISOString() })
            .eq("id", rfq.id);

        if (error) alert("Error extending: " + error.message);
        else {
            alert(`Extended by ${days} days!`);
            fetchData();
        }
    };

    const handleManualQuote = async () => {
        if (!rfq) return;
        const price = prompt("Enter Offer Price for Buyer (₹):");
        if (!price) return;

        const dummyQuote: SupplierQuote = {
            id: 'manual',
            supplier_name: 'Admin Manual Offer',
            price: Number(price),
            lead_time: rfq.lead_time_admin || "TBD",
            remarks: "Direct offer from Admin",
            status: 'Selected',
            created_at: new Date().toISOString()
        };

        handleSendToBuyer(dummyQuote);
    };

    const handleApproveOrder = async () => {
        if (!rfq) return;
        if (!confirm("Move this to Active Orders? This will create a new Order record.")) return;

        setSaving(true);
        try {
            // 1. Check if order exists
            const { data: existing } = await supabase.from("orders").select("id").eq("rfq_id", rfq.id).single();
            if (existing) {
                router.push(`/admin/buyers/orders/${existing.id}`);
                return;
            }

            const { data: newOrder, error } = await supabase
                .from("orders")
                .insert({
                    rfq_id: rfq.id,
                    buyer_id: rfq.user_id,
                    order_number: "ORD-" + new Date().getFullYear() + "-" + (rfq.rfq_number.split("-").pop() || "000"),
                    status: 'In Progress',
                    total_value: rfq.quote_price || 0,
                })
                .select()
                .single();

            if (error) throw error;

            // 3. Redirect
            router.push(`/admin/buyers/orders/${newOrder.id}`);

        } catch (err: any) {
            console.error(err);
            alert("Error creating order: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!rfq) return <div className="p-8">RFQ Not Found</div>;

    // --- VIEW: PARENT RFQ DASHBOARD ---
    if (isParent) {
        return (
            <div className="max-w-7xl mx-auto pb-24 p-6">
                <h1 className="text-2xl font-bold mb-2">Parent RFQ: {rfq.rfq_number}</h1>
                <p className="text-gray-500 mb-8">Uploaded by {rfq.profiles.name} • {rfq.admin_status}</p>

                {/* Section A: Items from Buyer */}
                <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
                    <h2 className="text-lg font-bold mb-4">Buyer Uploaded Items</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                                <tr>
                                    <th className="px-4 py-3">Drawing</th>
                                    <th className="px-4 py-3">Qty</th>
                                    <th className="px-4 py-3">Target</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rfqItems.map((item) => {
                                    // Check if sub-rfq already exists for this item (heuristic matching drawing_number?)
                                    // ideally we link item_id, but for now purely manual trigger
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">
                                                {item.drawing_number}
                                                {item.file_url && <a href={item.file_url} target="_blank" className="ml-2 text-blue-600 text-xs hover:underline">View</a>}
                                            </td>
                                            <td className="px-4 py-3">{item.quantity}</td>
                                            <td className="px-4 py-3">₹{item.target_price || '-'}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleCreateSubRfq(item)}
                                                    className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-xs"
                                                >
                                                    Create Sub-RFQ
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section B: Created Sub-RFQs */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h2 className="text-lg font-bold mb-4">Active Sub-RFQs</h2>
                    {subRfqs.length === 0 ? (
                        <p className="text-gray-400 text-sm italic">No Sub-RFQs created yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subRfqs.map(sub => (
                                <Link
                                    href={`/admin/buyers/rfqs/${sub.id}`}
                                    key={sub.id}
                                    className="block p-4 border rounded-lg hover:border-blue-400 hover:shadow-md transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-gray-900 group-hover:text-blue-600">{sub.rfq_number}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${statusColor(sub.admin_status)}`}>
                                            {sub.admin_status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-1">Drwg: {sub.drawing_number || 'N/A'}</p>
                                    <div className="flex justify-between items-end mt-4">
                                        <span className="text-xs text-gray-400">Created: {new Date(sub.created_at).toLocaleDateString()}</span>
                                        <span className="text-blue-600 text-xs font-medium">Manage &rarr;</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- VIEW: SUB-RFQ INTERFACE (Original Logic) ---
    return (
        <div className="max-w-6xl mx-auto pb-24">
            {/* Add Breadcrumb for Sub-RFQ */}
            {/* @ts-ignore */}
            {rfq.parent_rfq_id && (
                <div className="mb-4">
                    {/* Link back to parent? We assume parent_rfq_id is the ID */}
                    {/* @ts-ignore */}
                    <Link href={`/admin/buyers/rfqs/${rfq.parent_rfq_id}`} className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
                        &larr; Back to Parent Review
                    </Link>
                </div>
            )}
            {/* Header */}
            <div className="mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between sticky top-4 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/admin/buyers/rfqs" className="text-gray-500 hover:text-blue-600">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {rfq.rfq_number}
                            <span className="text-sm font-normal text-gray-500">by {rfq.profiles.name}</span>
                            {/* @ts-ignore */}
                            {rfq.status === 'Draft' && <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">DRAFT</span>}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${statusColor(rfq.admin_status)}`}>
                        {rfq.admin_status}
                    </span>
                    {rfq.admin_status === 'Live' && (
                        <button onClick={handleMockQuote} className="px-3 py-1.5 bg-gray-800 text-white text-xs rounded hover:bg-gray-700">
                            + Mock Quote
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* COLUMN 1: BUYER & SPECS (Always Visible) */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Download className="h-4 w-4" /> Specs
                        </h3>
                        <div className="space-y-3 text-sm">
                            <p><span className="text-gray-500">File:</span> {rfq.file_name}</p>
                            <p><span className="text-gray-500">Qty:</span> {rfq.quantity}</p>
                            <p><span className="text-gray-500">Material:</span> {rfq.material_admin || "Pending"}</p>
                            <p><span className="text-gray-500">Weight:</span> {rfq.weight_per_piece} kg</p>
                        </div>
                    </div>
                </div>

                {/* COLUMN 2 & 3: ACTION AREA (Dynamic) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* STATE: NEW -> LIVE FORM */}
                    {(rfq.admin_status === 'New' || rfq.admin_status === 'Draft') && (
                        <div className="bg-white p-8 rounded-xl border border-blue-100 shadow-sm ring-4 ring-blue-50">
                            <h2 className="text-lg font-bold mb-6">Step 1: Validate & Make Live (Publish)</h2>
                            <form onSubmit={handleSubmitLive(onSubmitLive)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input {...registerLive("weight_per_piece")} placeholder="Weight (kg)" className="input-field" type="number" step="0.001" />
                                    <input {...registerLive("material_admin")} placeholder="Refined Material" className="input-field" />
                                    <input {...registerLive("finish")} placeholder="Finish" className="input-field" />
                                    <input {...registerLive("lead_time_admin")} placeholder="Std Lead Time" className="input-field" />
                                    <input {...registerLive("visibility_days")} placeholder="Days Visible (e.g. 3)" className="input-field" type="number" defaultValue={3} />
                                    <input {...registerLive("admin_notes")} placeholder="Notes for Supplier" className="input-field" />
                                </div>
                                <button type="submit" disabled={saving} className="btn-primary w-full">
                                    {saving ? "Saving..." : "Make Live to Suppliers"}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* STATE: LIVE OR QUOTED -> SHOW QUOTES */}
                    {(rfq.admin_status === 'Live' || rfq.admin_status === 'Quoted') && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold">Supplier Quotes ({quotes.length})</h2>
                                <div className="flex gap-2">
                                    <button onClick={handleExtendVisibility} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200 border border-gray-300">
                                        Extend Visibility
                                    </button>
                                    <button onClick={handleManualQuote} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-medium">
                                        Manual Offer to Buyer
                                    </button>
                                </div>
                            </div>
                            {quotes.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No quotes yet. Waiting for suppliers...
                                    <br />
                                    <span className="text-xs">(Use "Mock Quote" button above to test)</span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {quotes.map(q => (
                                        <div key={q.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                            <div>
                                                <p className="font-bold text-gray-900">{q.supplier_name}</p>
                                                <p className="text-sm text-gray-500">{q.lead_time} Lead Time</p>
                                                <p className="text-xs text-gray-400">{q.remarks}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-green-600">₹{q.price}</p>
                                                <button
                                                    onClick={() => handleSendToBuyer(q)}
                                                    className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                                >
                                                    Select & Send to Buyer
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STATE: SENT TO BUYER / REJECTED -> NEGOTIATION */}
                    {(['Sent to Buyer', 'Rejected', 'Approved'].includes(rfq.admin_status)) && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[500px]">
                            <h2 className="text-lg font-bold mb-4 border-b pb-2">Negotiation History</h2>

                            <div className="flex-1 overflow-y-auto space-y-4 p-2 mb-4">
                                {negotiations.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender_role === 'admin' ? 'bg-blue-50 text-blue-900 rounded-tr-none' : 'bg-gray-100 text-gray-900 rounded-tl-none'
                                            }`}>
                                            <p className="text-xs font-bold mb-1 uppercase text-opacity-50">{msg.sender_role}</p>
                                            <p className="text-sm">{msg.notes}</p>
                                            {msg.price > 0 && (
                                                <p className="mt-2 font-bold text-lg">Offered: ₹{msg.price}</p>
                                            )}
                                            <p className="text-[10px] text-right mt-1 opacity-50">
                                                {new Date(msg.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Negotiation Input (Only if not approved) */}
                            {rfq.admin_status !== 'Approved' && (
                                <form onSubmit={handleSubmitNeg(onSubmitNegotiation)} className="border-t pt-4">
                                    <div className="flex items-end gap-2">
                                        <div className="flex-1 space-y-2">
                                            <input
                                                {...registerNeg("price")}
                                                type="number"
                                                placeholder="New Price (₹)"
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                                defaultValue={rfq.quote_price}
                                            />
                                            <textarea
                                                {...registerNeg("notes")}
                                                placeholder="Message to Buyer..."
                                                rows={2}
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none"
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
                                            <Send className="h-5 w-5" />
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* STATE: APPROVED -> ORDERS */}
                    {rfq.admin_status === 'Approved' && (
                        <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-center">
                            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                            <h2 className="text-2xl font-bold text-green-800 mb-2">Order Approved!</h2>
                            <p className="text-green-700 mb-6">The buyer has accepted the quote of ₹{rfq.quote_price}.</p>

                            <div className="flex justify-center gap-4">
                                <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                    Upload PI
                                </button>
                                <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-bold shadow-lg shadow-green-200">
                                    Move to Official Orders
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* CSS Helper class injected here for simplicity */}
            <style jsx>{`
                .input-field {
                    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all;
                }
                .btn-primary {
                    @apply bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md;
                }
            `}</style>
        </div>
    );
}

function statusColor(status: string) {
    switch (status) {
        case 'New': return 'bg-gray-100 text-gray-600 border-gray-200';
        case 'Live': return 'bg-blue-50 text-blue-600 border-blue-200';
        case 'Quoted': return 'bg-purple-50 text-purple-600 border-purple-200';
        case 'Sent to Buyer': return 'bg-orange-50 text-orange-600 border-orange-200';
        case 'Rejected': return 'bg-red-50 text-red-600 border-red-200';
        case 'Approved': return 'bg-green-50 text-green-600 border-green-200';
        default: return 'bg-gray-100 text-gray-600';
    }
}
