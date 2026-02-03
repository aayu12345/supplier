"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function QuoteSuccessPage() {
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        // Auto-redirect after 5 seconds
        const timer = setTimeout(() => {
            router.push("/dashboard/supplier/my-rfqs");
        }, 5000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full space-y-8">
                {/* Success Message */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Thank you for submitting your quote
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Our team will review your offer and get back to you shortly.
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Thank you for submitting your quote
                        </h2>
                        <p className="text-gray-600">for RFQ #{params.rfqId}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/dashboard/supplier/my-rfqs"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            View My Quotes
                        </Link>
                        <Link
                            href="/dashboard/supplier/marketplace"
                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors"
                        >
                            Browse More RFQs
                        </Link>
                    </div>

                    <p className="text-sm text-gray-500 mt-6">
                        Redirecting to My RFQs in 5 seconds...
                    </p>
                </div>

                {/* Horizontal Ad Banner */}
                <div className="bg-yellow-50 rounded-xl border-2 border-yellow-200 p-8 relative">
                    <div className="absolute top-3 left-3 bg-yellow-200 px-2 py-1 rounded text-xs font-bold text-gray-600">
                        Ad
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-4xl">🎯</div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Ad</h3>
                                <p className="text-gray-600">www.example.com</p>
                            </div>
                        </div>
                        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                            Learn more
                        </button>
                    </div>
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">Google</div>
                </div>
            </div>
        </div>
    );
}
