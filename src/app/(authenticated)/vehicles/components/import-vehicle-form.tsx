"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Upload,
    Download,
    FileSpreadsheet,
    Loader2,
    AlertCircle,
    CheckCircle,
    Info
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// CSV template header
const CSV_TEMPLATE =
    `registration_no,make,model,year,chassis_no,engine_no,body_type_id,category_id,vehicle_type_id,client_id,seating_capacity,cubic_capacity,gross_weight
UBC123D,Toyota,Corolla,2022,JTDZS3EU0E3298500,2ZR-3298500,body_type_id_here,category_id_here,vehicle_type_id_here,client_id_here,5,1800,1500
UBE456F,Honda,Civic,2021,HDZS3EU0E3298501,2FG-3298501,body_type_id_here,category_id_here,vehicle_type_id_here,client_id_here,5,1600,1400`;

interface ImportVehicleFormProps {
    clientId?: string;
    onImportComplete: () => void;
    compact?: boolean;
}

export function ImportVehicleForm({ clientId, onImportComplete, compact = false }: ImportVehicleFormProps) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadResult, setUploadResult] = useState<{
        success: number;
        failed: number;
        errors?: string[];
    } | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const downloadTemplate = () => {
        const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vehicle_import_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (!selectedFile.name.endsWith('.csv')) {
                toast.error("Please upload a CSV file");
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (!droppedFile.name.endsWith('.csv')) {
                toast.error("Please upload a CSV file");
                return;
            }
            setFile(droppedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file to upload");
            return;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);
            setUploadResult(null);

            // Create FormData object
            const formData = new FormData();
            formData.append('file', file);

            if (clientId) {
                formData.append('clientId', clientId);
            }

            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 500);

            // Make the API call
            const response = await fetch('/api/vehicles/bulk-upload', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to upload vehicles");
            }

            const result = await response.json();
            setUploadResult({
                success: result.success,
                failed: result.failed,
                errors: result.errors
            });

            if (result.success > 0) {
                toast.success(`Successfully imported ${result.success} vehicles`);
            }

            if (result.failed === 0 && result.success > 0) {
                // Only close the dialog on complete success
                setTimeout(() => {
                    setOpen(false);
                    onImportComplete();
                }, 1500);
            }
        } catch (error) {
            console.error("Error uploading vehicles:", error);
            toast.error("Failed to upload vehicles");
        } finally {
            setIsUploading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setUploadResult(null);
        setUploadProgress(0);
    };

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            setOpen(newOpen);
            if (!newOpen) {
                resetForm();
            }
        }}>
            <DialogTrigger asChild onClick={() => setOpen(true)}>
                {compact ? (
                    <Button variant="outline" size="sm" className="h-8 ml-2 border-green-200 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-950/20">
                        <Upload className="h-3.5 w-3.5 mr-1.5 text-green-600" />
                        Import Vehicles
                    </Button>
                ) : (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-green-200 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-950/20" aria-label="Import vehicles">
                                    <Upload className="h-4 w-4 text-green-600" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                                Import vehicles
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        Import Vehicles
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {!uploadResult && (
                        <>
                            <div
                                className={`border-2 border-dashed rounded-lg p-10 transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20"
                                    } ${file ? "bg-muted/20" : ""}`}
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                            >
                                <div className="flex flex-col items-center justify-center space-y-3 text-center">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-muted">
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    {!file ? (
                                        <>
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium">Drag & drop your CSV file here</p>
                                                <p className="text-xs text-muted-foreground">
                                                    or click to browse files (max 500 vehicles)
                                                </p>
                                            </div>

                                            <input
                                                id="file-upload"
                                                type="file"
                                                accept=".csv"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                            <label htmlFor="file-upload">
                                                <Button type="button" variant="outline" size="sm">
                                                    Select File
                                                </Button>
                                            </label>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center space-y-2">
                                            <p className="text-sm font-medium">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </p>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setFile(null)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Alert className="bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                                <Info className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                                    Required IDs
                                </AlertTitle>
                                <AlertDescription className="text-xs text-green-600 dark:text-green-400">
                                    You'll need to provide the correct IDs for body types, categories, vehicle types, and clients.
                                    These can be found in the Settings page and Clients page.
                                </AlertDescription>
                            </Alert>

                            <div className="rounded-lg border overflow-hidden">
                                <div className="bg-muted/50 px-3 py-2 text-sm font-medium">
                                    Template Instructions
                                </div>
                                <div className="p-3">
                                    <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4">
                                        <li>Use CSV format with the exact columns specified in the template</li>
                                        <li>Registration number, make, model, year, chassis and engine numbers are required</li>
                                        <li>You will need to obtain the correct IDs for body types, categories, vehicle types, and client</li>
                                        <li>Seating capacity, cubic capacity, and gross weight are optional</li>
                                        <li>Registration numbers must be unique in the system</li>
                                    </ul>
                                    <div className="mt-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-green-200 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-950/20"
                                            onClick={downloadTemplate}
                                        >
                                            <Download className="h-3.5 w-3.5 mr-1 text-green-600" />
                                            Download Template
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {isUploading && (
                        <div className="space-y-4">
                            <p className="text-sm font-medium text-center">Uploading vehicles...</p>
                            <div className="bg-green-100 dark:bg-green-950/40 rounded-full overflow-hidden">
                                <Progress value={uploadProgress} className="h-2 [&>div]:bg-green-600" />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                This may take a few minutes for large files
                            </p>
                        </div>
                    )}

                    {uploadResult && (
                        <div className="space-y-4">
                            <Alert variant={uploadResult.failed > 0 ? "destructive" : "default"}>
                                <div className="flex gap-2">
                                    {uploadResult.failed > 0 ? (
                                        <AlertCircle className="h-4 w-4" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4" />
                                    )}
                                    <AlertTitle>Upload {uploadResult.failed === 0 ? "Complete" : "Completed with Errors"}</AlertTitle>
                                </div>
                                <AlertDescription className="mt-2">
                                    <p>Successfully uploaded {uploadResult.success} vehicles</p>
                                    {uploadResult.failed > 0 && (
                                        <p>Failed to upload {uploadResult.failed} vehicles</p>
                                    )}
                                </AlertDescription>
                            </Alert>

                            {uploadResult.errors && uploadResult.errors.length > 0 && (
                                <Card>
                                    <CardContent className="pt-4 px-4 max-h-[200px] overflow-y-auto">
                                        <h4 className="text-sm font-medium mb-2">Errors:</h4>
                                        <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4">
                                            {uploadResult.errors.map((error, index) => (
                                                <li key={index}>{error}</li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="flex justify-end gap-2">
                                {uploadResult.failed > 0 && (
                                    <Button type="button" onClick={resetForm}>
                                        Try Again
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {!uploadResult && (
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleUpload}
                            disabled={!file || isUploading}
                            className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                        >
                            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Import Vehicles
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
} 