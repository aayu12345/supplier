import Link from "next/link";
import { LogIn, UserPlus, UploadCloud, ArrowLeft } from "lucide-react";

export default function BuyerEntryPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center mb-6 text-gray-400 hover:text-gray-600 transition-colors">
                    <ArrowLeft className="h-6 w-6" />
                </Link>
                <div className="flex justify-center">
                    <div className="bg-blue-600 rounded-lg p-2">
                        {/* Logo Icon */}
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                            <path d="M3 21h18M5 21V7l8-4 8 4v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Welcome to TheSupplier
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Select how you would like to proceed
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-4">

                    {/* Option 1: Login */}
                    <Link href="/auth/login?role=buyer" className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <LogIn className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">Log In</h3>
                            <p className="text-sm text-gray-500">Access your existing account</p>
                        </div>
                    </Link>

                    {/* Option 2: Register */}
                    <Link href="/auth/register" className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group">
                        <div className="bg-purple-100 p-3 rounded-full text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <UserPlus className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">Register</h3>
                            <p className="text-sm text-gray-500">Create a new buyer account</p>
                        </div>
                    </Link>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">or</span>
                        </div>
                    </div>

                    {/* Option 3: Guest / Get Quote */}
                    <Link href="/dashboard/buyer?action=upload" className="flex items-center p-4 border-2 border-blue-600 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer relative overflow-hidden">
                        <div className="bg-white p-3 rounded-full text-blue-600 shadow-sm z-10">
                            <UploadCloud className="h-6 w-6" />
                        </div>
                        <div className="ml-4 z-10">
                            <h3 className="text-lg font-bold text-gray-900">Get a Quote</h3>
                            <p className="text-sm text-gray-600">Upload RFQ without an account</p>
                        </div>
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-200 rounded-full opacity-50 blur-xl"></div>
                    </Link>

                </div>
            </div>
        </div>
    );
}
