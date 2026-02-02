"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Mail, Phone, Building } from "lucide-react";
import Link from "next/link";

type BuyerProfile = {
    id: string;
    email: string;
    name: string;
    phone: string;
    company_name: string;
    created_at: string;
};

export default function BuyersListPage() {
    const [buyers, setBuyers] = useState<BuyerProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const supabase = createClient();

    useEffect(() => {
        fetchBuyers();
    }, []);

    const fetchBuyers = async () => {
        setLoading(true);
        try {
            // Fetch ALL profiles (Filtering in JS to avoid array query issues)
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Supabase Error Details:", error.message, error.details, error.hint);
                throw error;
            }

            // Client-side Filter for Array
            const buyersOnly = (data || []).filter((p: any) =>
                Array.isArray(p.role) ? p.role.includes("buyer") : p.role === "buyer"
            );

            setBuyers(buyersOnly);
        } catch (error: any) {
            console.error("Error fetching buyers:", error);
            alert("Failed to fetch buyers: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const filteredBuyers = buyers.filter(b =>
        b.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        b.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[600px]">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900">All Buyers</h2>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search buyers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading buyers...</div>
                ) : buyers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No buyers found.</div>
                ) : (
                    <table className="w-full text-left bg-white">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Name / Company</th>
                                <th className="px-6 py-4 font-semibold">Contact Info</th>
                                <th className="px-6 py-4 font-semibold">Joined At</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBuyers.map((buyer) => (
                                <tr key={buyer.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                                                {buyer.name?.[0] || "B"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{buyer.name || "Unknown"}</p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Building className="h-3 w-3" /> {buyer.company_name || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3 w-3 text-gray-400" /> {buyer.email}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3 w-3 text-gray-400" /> {buyer.phone || "N/A"}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(buyer.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/admin/buyers/${buyer.id}`} className="text-blue-600 font-medium hover:underline text-sm">
                                            View Activity
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
