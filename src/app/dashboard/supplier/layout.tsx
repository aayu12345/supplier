import { Factory } from "lucide-react";
import Link from "next/link";
import SupplierAccountMenu from "@/components/SupplierAccountMenu";

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

                        <div className="flex items-center">
                            <SupplierAccountMenu />
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
