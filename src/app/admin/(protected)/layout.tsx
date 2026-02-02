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
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <Shield className="h-6 w-6 text-blue-500" />
                        <span>Supplier Admin</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <NavItem href="/admin/dashboard" icon={<LayoutDashboard />} label="Dashboard" />
                    <NavItem href="/admin/rfqs" icon={<FileText />} label="RFQs" />
                    <NavItem href="/admin/orders" icon={<ShoppingCart />} label="Orders" />
                    <NavItem href="/admin/users" icon={<Users />} label="Users" />
                    <NavItem href="/admin/settings" icon={<Settings />} label="Settings" />
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="bg-blue-900/50 h-8 w-8 rounded-full flex items-center justify-center text-blue-400 font-bold">
                            {(user.email?.[0] || 'A').toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.email}</p>
                            <p className="text-xs text-gray-500">Administrator</p>
                        </div>
                    </div>
                    <form action={signOutAdmin}>
                        <button className="w-full flex items-center gap-2 text-red-400 hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors text-sm">
                            <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
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
