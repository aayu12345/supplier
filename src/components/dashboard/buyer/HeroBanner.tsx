import { FolderOpen, UploadCloud } from "lucide-react";

interface HeroBannerProps {
    onUploadClick: () => void;
}

export default function HeroBanner({ onUploadClick }: HeroBannerProps) {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 relative overflow-hidden border border-blue-100/50">
            {/* Background Decor */}
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#2563EB" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.2,-19.2,95.8,-4.2C93.4,10.8,81.8,25.9,71,38.8C60.2,51.7,50.2,62.4,38.6,70.7C27,79,13.8,84.9,-0.6,85.9C-15,86.9,-28.9,82.9,-41.2,75.1C-53.5,67.3,-64.2,55.7,-72.2,42.5C-80.2,29.3,-85.5,14.5,-84.3,0.3C-83.1,-13.9,-75.4,-27.5,-66.2,-39.6C-57,-51.7,-46.3,-62.3,-34.2,-70.6C-22.1,-78.9,-8.6,-84.9,2.9,-89.9C14.4,-94.9,28.8,-98.9,44.7,-76.4Z" transform="translate(100 100)" />
                </svg>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
                <div className="md:w-1/2 space-y-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                        Store and upload your design files to request quotes
                    </h2>

                    <button
                        onClick={onUploadClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 flex items-center gap-3 transition-transform hover:-translate-y-1"
                    >
                        <UploadCloud className="h-6 w-6" />
                        UPLOAD YOUR DRAWINGS
                    </button>

                    <p className="text-gray-500 text-sm font-medium">
                        Supports PDF, DWG, DXF, STEP, IGES
                    </p>
                </div>

                {/* Illustration Placeholder - Representing Folders */}
                <div className="hidden md:flex md:w-1/2 justify-end mt-8 md:mt-0">
                    <div className="relative">
                        {/* Yellow Folder Icon representation */}
                        <div className="w-48 h-36 bg-yellow-400 rounded-lg shadow-xl relative transform -rotate-6 z-10 flex items-center justify-center border-t-4 border-yellow-300">
                            <FolderOpen className="h-16 w-16 text-yellow-700 opacity-50" />
                        </div>
                        <div className="w-48 h-36 bg-yellow-400 rounded-lg shadow-md absolute top-0 -right-12 transform rotate-12 flex items-center justify-center border-t-4 border-yellow-300">
                            <FolderOpen className="h-16 w-16 text-yellow-700 opacity-50" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
