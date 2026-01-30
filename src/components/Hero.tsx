import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
    return (
        <div className="relative overflow-hidden bg-white pt-16 pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                {/* Badge */}
                <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-8">
                    <span className="mr-2">⚡</span> B2B Manufacturing RFQ Marketplace
                </div>

                {/* Heading */}
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 max-w-4xl">
                    Streamline Your <br className="hidden md:block" />
                    Manufacturing <span className="text-blue-600">Procurement</span>
                </h1>

                {/* Subheading */}
                <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto mb-10">
                    Connect buyers with verified suppliers. Upload RFQs, receive competitive
                    quotes, and manage orders from production to payment — all in one
                    platform.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
                    <Link
                        href="#demo"
                        className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 md:text-lg transition-colors"
                    >
                        Try Demo
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    <Link
                        href="#learn-more"
                        className="inline-flex items-center justify-center px-8 py-3.5 border border-gray-200 text-base font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 md:text-lg transition-colors"
                    >
                        Learn More
                    </Link>
                </div>
            </div>
        </div>
    );
}
