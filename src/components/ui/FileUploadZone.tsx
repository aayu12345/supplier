"use client";

import { UploadCloud, File, X } from "lucide-react";
import { useState, useRef, ChangeEvent } from "react";

interface FileUploadZoneProps {
    onFileSelect: (file: File | null) => void;
    selectedFile: File | null;
}

export default function FileUploadZone({ onFileSelect, selectedFile }: FileUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file: File) => {
        // Check size (25MB)
        if (file.size > 25 * 1024 * 1024) {
            alert("File size must be less than 25MB");
            return;
        }
        // Check type (simple check)
        // const allowedTypes = [".pdf", ".dxf", ".step", ".igs", ".stl", ".zip", ".dwg"];
        // For now allow all, rely on backend or strict extension check if needed
        onFileSelect(file);
    };

    const removeFile = () => {
        onFileSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="w-full">
            {!selectedFile ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                        }`}
                >
                    <div className="bg-blue-100 p-3 rounded-full mb-4">
                        <UploadCloud className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                        <span className="text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        PDF, DWG, DXF, STEP, IGES (max 25MB)
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileInput}
                    />
                </div>
            ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-white p-2 rounded-lg border border-blue-100">
                            <File className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                        }}
                        type="button"
                        className="p-1 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-red-500"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
