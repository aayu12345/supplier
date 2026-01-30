import Link from "next/link";
import { Menu } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
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
            <div className="flex flex-col">
              <span className="font-bold text-xl leading-none text-gray-900">
                TheSupplier
              </span>
              <span className="text-[10px] text-blue-600 leading-none font-medium">
                .in
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-gray-500 hover:text-gray-900 font-medium transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-500 hover:text-gray-900 font-medium transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="#demo"
              className="text-gray-500 hover:text-gray-900 font-medium transition-colors"
            >
              Demo
            </Link>
          </div>

          {/* Mobile menu button (placeholder functionality) */}
          <div className="md:hidden">
            <button className="text-gray-500 hover:text-gray-900">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
