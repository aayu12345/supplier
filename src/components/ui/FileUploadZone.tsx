"use client";

import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { useState, useRef, ChangeEvent } from "react";

interface FileUploadZoneProps {
    onFilesSelect: (files: File[]) => void;
    selectedFiles: File[];
    allowMultiple?: boolean;
}

export default function FileUploadZone({ onFilesSelect, selectedFiles, allowMultiple = false }: FileUploadZoneProps) {
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

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSetFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFiles(Array.from(e.target.files));
        }
    };

    const validateAndSetFiles = (files: File[]) => {
        const validFiles = files.filter(file => {
            if (file.size > 25 * 1024 * 1024) {
                alert(`File ${file.name} is too large. Max size is 25MB.`);
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            if (allowMultiple) {
                onFilesSelect([...selectedFiles, ...validFiles]);
            } else {
                onFilesSelect([validFiles[0]]);
            }
        }
    };

    const removeFile = (indexToRemove: number) => {
        const newFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
        onFilesSelect(newFiles);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="w-full space-y-4">
            {/* Show dropzone if we allow multiple OR if no files are selected yet */}
            {(allowMultiple || selectedFiles.length === 0) && (
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
                        multiple={allowMultiple}
                        onChange={handleFileInput}
                    />
                </div>
            )}

            {/* List of selected files */}
            {selectedFiles.length > 0 && (
                <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="bg-white p-2 rounded-lg border border-blue-100">
                                    <FileIcon className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(index);
                                }}
                                type="button"
                                className="p-1 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-red-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
