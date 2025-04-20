"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpFromLine, File, X } from "lucide-react";

interface VehicleImportDropzoneProps {
    onFileSelected: (file: File) => void;
}

export function VehicleImportDropzone({ onFileSelected }: VehicleImportDropzoneProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];

        // Check file type
        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            toast.error("Please upload an Excel file (.xlsx or .xls)");
            return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should be less than 5MB");
            return;
        }

        setSelectedFile(file);
        onFileSelected(file);
    }, [onFileSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        maxFiles: 1
    });

    const removeFile = () => {
        setSelectedFile(null);
    };

    return (
        <Card className="w-full">
            <CardContent className="pt-6">
                {!selectedFile ? (
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
                            }`}
                    >
                        <input {...getInputProps()} />
                        <ArrowUpFromLine className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                            Drag & drop your Excel file here, or <span className="text-primary font-medium">browse</span>
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            Supports Excel files up to 5MB
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                            <File className="h-8 w-8 text-blue-500" />
                            <div>
                                <p className="text-sm font-medium">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500">
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={removeFile}
                            aria-label="Remove file"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 