import Link from "next/link";
import { LogIn, UserPlus, Factory, ArrowLeft } from "lucide-react";

export default function SupplierEntryPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center mb-6 text-gray-400 hover:text-gray-600 transition-colors">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div className="flex justify-center">
                    <div className="bg-green-600 rounded-lg p-2">
                        {/* Logo Icon */}
                        <Factory className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Supplier Portal
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Join our network to receive verified RFQs and grow your business
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-4">

                    {/* Option 1: Login */}
                    <Link href="/auth/login?role=supplier" className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all group">
                        <div className="bg-green-100 p-3 rounded-full text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <LogIn className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">Log In</h3>
                            <p className="text-sm text-gray-500">Access your supplier account</p>
                        </div>
                    </Link>

                    {/* Option 2: Register */}
                    <Link href="/auth/register?role=supplier" className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all group">
                        <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <UserPlus className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">Register</h3>
                            <p className="text-sm text-gray-500">Become a verified supplier</p>
                        </div>
                    </Link>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Benefits of joining</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 text-center">
                        <div className="bg-gray-50 p-2 rounded">Verified Leads</div>
                        <div className="bg-gray-50 p-2 rounded">Fast Payments</div>
                        <div className="bg-gray-50 p-2 rounded">Transparent RFQs</div>
                        <div className="bg-gray-50 p-2 rounded">Admin Support</div>
                    </div>

                </div>
            </div>
        </div>
    );
}
