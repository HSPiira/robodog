"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { VehicleImportDropzone } from "./vehicle-import-dropzone";
import { ArrowLeft, Upload, Car, Database } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";

export default function VehicleImportPage() {
    const router = useRouter();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelected = (file: File) => {
        setSelectedFile(file);
    };

    const handleImport = async () => {
        if (!selectedFile) {
            toast.error("Please select a file to import");
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await fetch("/api/vehicles/import/process", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to process import");
            }

            toast.success(`Import completed: ${data.summary?.processed || 0} vehicles processed`);
            router.push("/vehicles");
        } catch (error) {
            console.error("Import error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to process import");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <Breadcrumb className="mb-2">
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/vehicles" className="text-xs text-muted-foreground flex items-center">
                            <Car className="h-3 w-3 mr-1" />
                            Vehicles
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <BreadcrumbLink className="text-xs font-medium flex items-center">
                            <Database className="h-3 w-3 mr-1" />
                            Import Vehicles
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </Breadcrumb>

                <PageHeader
                    title="Import Vehicles"
                    description="Upload an Excel file to import vehicle data"
                    actions={
                        <Button variant="outline" size="sm" onClick={() => router.push("/vehicles")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Vehicles
                        </Button>
                    }
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upload Excel File</CardTitle>
                    <CardDescription>
                        Your Excel file should contain columns for registration number, make, model, year, chassis number,
                        engine number, body type, vehicle category, and vehicle type.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <VehicleImportDropzone onFileSelected={handleFileSelected} />

                    <div className="flex justify-end">
                        <Button
                            onClick={handleImport}
                            disabled={!selectedFile || isUploading}
                            className="w-full sm:w-auto"
                        >
                            {isUploading ? (
                                <>Processing...</>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import Vehicles
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 