"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Users, Award, Calendar, CheckCircle, XCircle, AlertCircle, TrendingUp, ChevronDown } from "lucide-react";
import Link from "next/link";
import { updateSupplierStatus } from "./actions";

type Supplier = {
    id: string;
    name: string;
    email: string;
    phone: string;
    city: string;
    trust_score: number;
    last_quote_date: string;
    status: string;
    login_frequency: number;
};

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCity, setFilterCity] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [sortBy, setSortBy] = useState<"trust_score" | "last_quote_date" | "login_frequency">("trust_score");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            // Fetch all users with supplier role
            const { data: profiles, error } = await supabase
                .from("profiles")
                .select("*")
                .contains("role", ["supplier"]);

            if (error) throw error;

            // Fetch supplier metrics for each supplier
            const suppliersData = await Promise.all(
                (profiles || []).map(async (profile) => {
                    // Get last quote date
                    const { data: lastQuote } = await supabase
                        .from("supplier_quotes")
                        .select("created_at")
                        .eq("supplier_id", profile.id)
                        .order("created_at", { ascending: false })
                        .limit(1)
                        .single();

                    // Get supplier metrics (trust score, etc.)
                    const { data: metrics } = await supabase
                        .from("supplier_metrics")
                        .select("*")
                        .eq("id", profile.id)
                        .single();

                    // Get supplier status from separate table
                    const { data: statusData } = await supabase
                        .from("supplier_status")
                        .select("status")
                        .eq("supplier_id", profile.id)
                        .single();

                    return {
                        id: profile.id,
                        name: profile.name || "N/A",
                        email: profile.email || "N/A",
                        phone: profile.phone || "N/A",
                        city: (profile as any).city || "N/A",
                        trust_score: metrics?.trust_score || 0,
                        last_quote_date: lastQuote?.created_at || null,
                        status: statusData?.status || "Active",
                        login_frequency: metrics?.login_frequency || 0,
                    };
                })
            );

            setSuppliers(suppliersData);
        } catch (err) {
            console.error("Error fetching suppliers:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (supplierId: string, newStatus: string) => {
        setUpdatingStatus(supplierId);
        try {
            const result = await updateSupplierStatus(supplierId, newStatus);

            if (result.error) {
                throw new Error(result.error);
            }

            // Update local state
            setSuppliers(suppliers.map(s =>
                s.id === supplierId ? { ...s, status: newStatus } : s
            ));
        } catch (err: any) {
            console.error("Error updating status:", err);
            alert(err.message || "Failed to update status");
        } finally {
            setUpdatingStatus(null);
        }
    };

    // Filter and sort suppliers
    const filteredSuppliers = suppliers
        .filter((supplier) => {
            const matchesSearch =
                supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                supplier.phone.includes(searchTerm);

            const matchesCity = !filterCity || supplier.city === filterCity;
            const matchesStatus = !filterStatus || supplier.status === filterStatus;

            return matchesSearch && matchesCity && matchesStatus;
        })
        .sort((a, b) => {
            const aValue = a[sortBy] || 0;
            const bValue = b[sortBy] || 0;

            if (sortBy === "last_quote_date") {
                const aDate = aValue ? new Date(aValue as string).getTime() : 0;
                const bDate = bValue ? new Date(bValue as string).getTime() : 0;
                return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
            }

            return sortOrder === "asc" ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
        });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Active":
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case "Inactive":
                return <XCircle className="h-4 w-4 text-gray-400" />;
            case "Blacklisted":
                return <AlertCircle className="h-4 w-4 text-red-600" />;
            default:
                return <CheckCircle className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusBadgeColor = (status: string) => {
        const colors = {
            Active: "bg-green-100 text-green-700 border-green-200",
            Inactive: "bg-gray-100 text-gray-700 border-gray-200",
            Blacklisted: "bg-red-100 text-red-700 border-red-200",
        };
        return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200";
    };

    const getTrustScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 50) return "text-yellow-600";
        return "text-red-600";
    };

    const getTrustScoreBg = (score: number) => {
        if (score >= 80) return "bg-green-50";
        if (score >= 50) return "bg-yellow-50";
        return "bg-red-50";
    };

    // Get unique values for filters
    const uniqueCities = Array.from(new Set(suppliers.map((s) => s.city).filter(Boolean)));

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
                                    <p className="text-sm text-gray-500">Monitor and manage all suppliers</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-blue-600" />
                                    <span className="text-2xl font-bold text-gray-900">{filteredSuppliers.length}</span>
                                    <span className="text-sm text-gray-500">Total</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-medium"
                            />
                        </div>
                    </div>

                    {/* Filters and Sorting */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* City Filter */}
                        <select
                            value={filterCity}
                            onChange={(e) => setFilterCity(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium bg-white"
                        >
                            <option value="">All Cities</option>
                            {uniqueCities.map((city) => (
                                <option key={city} value={city}>
                                    {city}
                                </option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium bg-white"
                        >
                            <option value="">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Blacklisted">Blacklisted</option>
                        </select>

                        <div className="h-6 w-px bg-gray-300 mx-2"></div>

                        {/* Sorting Buttons */}
                        <span className="text-sm font-medium text-gray-600">Sort:</span>
                        <button
                            onClick={() => {
                                setSortBy("trust_score");
                                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${sortBy === "trust_score"
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Trust Score {sortBy === "trust_score" && (sortOrder === "asc" ? "↑" : "↓")}
                        </button>
                        <button
                            onClick={() => {
                                setSortBy("last_quote_date");
                                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${sortBy === "last_quote_date"
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Last Quote {sortBy === "last_quote_date" && (sortOrder === "asc" ? "↑" : "↓")}
                        </button>
                        <button
                            onClick={() => {
                                setSortBy("login_frequency");
                                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            }}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${sortBy === "login_frequency"
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            Activity {sortBy === "login_frequency" && (sortOrder === "asc" ? "↑" : "↓")}
                        </button>
                    </div>
                </div>

                {/* Suppliers Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-blue-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Supplier Details
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Trust Score
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Last Quote
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={5} className="px-6 py-4">
                                                <div className="h-16 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg animate-pulse"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredSuppliers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Suppliers Found</h3>
                                            <p className="text-gray-500">
                                                {searchTerm || filterCity || filterStatus
                                                    ? "Try adjusting your filters"
                                                    : "No suppliers registered yet"}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSuppliers.map((supplier) => (
                                        <tr key={supplier.id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                        {supplier.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{supplier.name}</p>
                                                        <p className="text-xs text-gray-500">{supplier.email}</p>
                                                        <p className="text-xs text-gray-400">{supplier.phone}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col items-center">
                                                    <div className={`${getTrustScoreBg(supplier.trust_score)} px-3 py-2 rounded-lg`}>
                                                        <div className="flex items-center gap-2">
                                                            <Award className="h-4 w-4 text-yellow-500" />
                                                            <span className={`text-xl font-bold ${getTrustScoreColor(supplier.trust_score)}`}>
                                                                {supplier.trust_score}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-400 mt-1">/ 100</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {supplier.last_quote_date
                                                            ? new Date(supplier.last_quote_date).toLocaleDateString()
                                                            : "Never"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <select
                                                    value={supplier.status}
                                                    onChange={(e) => handleStatusChange(supplier.id, e.target.value)}
                                                    disabled={updatingStatus === supplier.id}
                                                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${getStatusBadgeColor(
                                                        supplier.status
                                                    )} ${updatingStatus === supplier.id ? "opacity-50 cursor-wait" : "hover:shadow-md"}`}
                                                >
                                                    <option value="Active">✓ Active</option>
                                                    <option value="Inactive">⊗ Inactive</option>
                                                    <option value="Blacklisted">⚠ Blacklisted</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <Link
                                                    href={`/admin/suppliers/${supplier.id}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-all shadow-md hover:shadow-lg"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
