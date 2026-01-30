export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-blue-600 rounded-lg p-1.5">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-white"
                        >
                            <path
                                d="M3 21h18M5 21V7l8-4 8 4v14"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <span className="font-bold text-xl text-gray-900">TheSupplier.in</span>
                </div>
                <p className="text-gray-500 text-sm">
                    © {new Date().getFullYear()} TheSupplier.in. B2B Manufacturing RFQ
                    Marketplace. Demo Version.
                </p>
            </div>
        </footer>
    );
}
