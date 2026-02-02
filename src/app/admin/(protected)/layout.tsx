import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    ShoppingCart,
    FileText,
    Users,
    Settings,
    LogOut,
    Shield
} from "lucide-react";
import { signOutAdmin } from "../actions";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    // Parallelize Auth and Role Check for speed
    // Optimization: Initiate both promises but we need user ID for the second one, so we can't fully parallelize without an edge function or more complex logic. 
    // However, getUser is fast.
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/admin/login");
    }

    // Role check
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    // Handle both single string (legacy/transition) and array types safely
    const roles = Array.isArray(profile?.role) ? profile.role : [profile?.role];

    if (!roles.includes("admin")) {
        redirect("/admin/login");
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Logo / Home Link */}
                    <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
                        <Link href="/admin/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <Shield className="h-6 w-6 text-blue-600" />
                            <span>Supplier Admin</span>
                        </Link>
                    </div>

                    {/* Right Side: User & Sign Out */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <span className="text-sm font-medium text-gray-900">{user.email}</span>
                            <span className="text-xs text-gray-500 uppercase">Administrator</span>
                        </div>

                        <form action={signOutAdmin}>
                            <button className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium">
                                <LogOut className="h-4 w-4" /> Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-all group"
        >
            <span className="group-hover:text-blue-400 transition-colors h-5 w-5">{icon}</span>
            <span className="font-medium">{label}</span>
        </Link>
    );
}
