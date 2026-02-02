import { signOut } from "@/app/auth/actions";
import { Factory, LogOut, User } from "lucide-react";
import Link from "next/link";

export default function SupplierLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                <Factory className="h-6 w-6" />
                            </div>
                            <Link href="/dashboard/supplier" className="text-xl font-bold text-gray-900">
                                Supplier Portal
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                                <User className="h-4 w-4" />
                                <span className="hidden md:inline">Supplier Account</span>
                            </div>
                            <div className="h-6 w-px bg-gray-200"></div>
                            <form action={signOut}>
                                <button className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50">
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden md:inline">Sign Out</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>
                {children}
            </main>
        </div>
    );
}
