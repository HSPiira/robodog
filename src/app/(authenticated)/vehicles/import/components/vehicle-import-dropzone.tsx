"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VehicleImportDropzoneProps {
    onFileUpload: (file: File) => void;
    isUploading: boolean;
    file: File | null;
}

export function VehicleImportDropzone({
    onFileUpload,
    isUploading,
    file,
}: VehicleImportDropzoneProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles?.[0]) {
                onFileUpload(acceptedFiles[0]);
            }
        },
        [onFileUpload]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "application/vnd.ms-excel": [".xls"],
            "text/csv": [".csv"],
        },
        maxFiles: 1,
        disabled: isUploading,
    });

    const removeFile = () => {
        if (!isUploading) {
            // Set file to null in parent component
            onFileUpload(null as unknown as File);
        }
    };

    return (
        <div className="space-y-4">
            {!file ? (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${isDragActive
                            ? "border-primary/70 bg-primary/5"
                            : "border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5"
                        }`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground">
                        <Upload className="h-10 w-10" />
                        <div className="space-y-1">
                            <p className="font-medium">
                                {isDragActive ? "Drop the file here" : "Drag and drop your file here"}
                            </p>
                            <p className="text-sm">or click to browse files</p>
                        </div>
                        <p className="text-xs">Supports Excel (.xlsx, .xls) and CSV files</p>
                    </div>
                </div>
            ) : (
                <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <File className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium text-sm">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB · {file.type || "Unknown type"}
                                </p>
                            </div>
                        </div>
                        {isUploading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        ) : (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground"
                                onClick={removeFile}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {isUploading && (
                        <div className="mt-3">
                            <div className="w-full bg-muted rounded-full h-1.5">
                                <div className="bg-primary h-1.5 rounded-full animate-pulse w-3/4"></div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Processing file...</p>
                        </div>
                    )}
                </div>
            )}

            {file && !isUploading && (
                <div className="flex items-center justify-end">
                    <Button variant="default" onClick={() => onFileUpload(file)}>
                        Process File
                    </Button>
                </div>
            )}
        </div>
    );
} 