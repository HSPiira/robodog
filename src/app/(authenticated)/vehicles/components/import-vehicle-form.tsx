"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import * as XLSX from 'xlsx';
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
    Info,
    ArrowRight,
    ArrowLeft,
    FileCheck,
    ChevronLeft,
    ChevronRight
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Template data for Excel file - Updated to use names instead of IDs
const TEMPLATE_DATA = [
    ["registration_no", "make", "model", "year", "chassis_no", "engine_no", "body_type", "category", "vehicle_type", "client", "seating_capacity", "cubic_capacity", "gross_weight"],
    ["UBC123D", "Toyota", "Corolla", 2022, "JTDZS3EU0E3298500", "2ZR-3298500", "Sedan", "Private", "Passenger", "John Doe", 5, 1800, 1500],
    ["UBE456F", "Honda", "Civic", 2021, "HDZS3EU0E3298501", "2FG-3298501", "Hatchback", "Commercial", "Passenger", "Jane Smith", 5, 1600, 1400]
];

// Define types for reference data
interface ReferenceItem {
    id: string;
    name: string;
}

interface ImportVehicleFormProps {
    clientId?: string;
    onImportComplete: () => void;
    compact?: boolean;
}

// Define the steps for the import process
type ImportStep = 'file-selection' | 'data-review';

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
    const [importMethod, setImportMethod] = useState<'names' | 'ids'>('names');
    const [isProgressActive, setIsProgressActive] = useState(false);

    // Step-based import flow
    const [currentStep, setCurrentStep] = useState<ImportStep>('file-selection');
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);

    // Reference data states
    const [bodyTypes, setBodyTypes] = useState<ReferenceItem[]>([]);
    const [vehicleCategories, setVehicleCategories] = useState<ReferenceItem[]>([]);
    const [vehicleTypes, setVehicleTypes] = useState<ReferenceItem[]>([]);
    const [clients, setClients] = useState<ReferenceItem[]>([]);
    const [isLoadingReference, setIsLoadingReference] = useState(false);
    const [referenceDataError, setReferenceDataError] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Calculate paginated data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return previewData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [previewData, currentPage]);

    const totalPages = Math.ceil(previewData.length / ITEMS_PER_PAGE);

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    // Reset page when data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [previewData]);

    // Fetch reference data when dialog opens
    useEffect(() => {
        if (open) {
            fetchReferenceData();
        }
    }, [open]);

    // Reset reference data loading state when dialog closes
    useEffect(() => {
        if (!open) {
            setIsLoadingReference(false);
            setReferenceDataError(false);
        }
    }, [open]);

    // Fetch all reference data needed for the import
    const fetchReferenceData = async () => {
        const controller = new AbortController();
        setIsLoadingReference(true);
        setReferenceDataError(false);

        try {
            // Fetch all reference data in parallel
            const [bodyTypesRes, categoriesRes, typesRes, clientsRes] = await Promise.all([
                fetch('/api/body-types', { signal: controller.signal }),
                fetch('/api/vehicle-categories', { signal: controller.signal }),
                fetch('/api/vehicle-types', { signal: controller.signal }),
                clientId ? Promise.resolve(null) : fetch('/api/clients', { signal: controller.signal })
            ]);

            // Check responses and parse JSON in parallel
            const [bodyTypesData, categoriesData, typesData, clientsData] = await Promise.all([
                bodyTypesRes.json(),
                categoriesRes.json(),
                typesRes.json(),
                clientsRes ? clientsRes.json() : Promise.resolve(null)
            ]);

            // Process body types
            const bodyTypesResult = bodyTypesData.data || bodyTypesData;
            if (Array.isArray(bodyTypesResult)) {
                setBodyTypes(bodyTypesResult.map((item: any) => ({ id: item.id, name: item.name })));
            } else {
                console.error("bodyTypesData is not an array:", bodyTypesData);
                setBodyTypes([]);
                throw new Error("Invalid body types data format");
            }

            // Process vehicle categories
            const categoriesResult = categoriesData.data || categoriesData;
            if (Array.isArray(categoriesResult)) {
                setVehicleCategories(categoriesResult.map((item: any) => ({ id: item.id, name: item.name })));
            } else {
                console.error("categoriesData is not an array:", categoriesData);
                setVehicleCategories([]);
                throw new Error("Invalid vehicle categories data format");
            }

            // Process vehicle types
            const typesResult = typesData.data || typesData;
            if (Array.isArray(typesResult)) {
                setVehicleTypes(typesResult.map((item: any) => ({ id: item.id, name: item.name })));
            } else {
                console.error("typesData is not an array:", typesData);
                setVehicleTypes([]);
                throw new Error("Invalid vehicle types data format");
            }

            // Process clients if fetched
            if (clientsData) {
                const clientsResult = clientsData.data || clientsData;
                if (Array.isArray(clientsResult)) {
                    setClients(clientsResult.map((item: any) => ({ id: item.id, name: item.name })));
                } else {
                    console.error("clientsData is not an array:", clientsData);
                    setClients([]);
                    throw new Error("Invalid clients data format");
                }
            }
        } catch (error) {
            // Only set error state if the request wasn't aborted
            if (!controller.signal.aborted) {
                console.error("Error fetching reference data:", error);
                toast.error("Failed to load reference data");
                setReferenceDataError(true);
            }
        } finally {
            // Only update loading state if the request wasn't aborted
            if (!controller.signal.aborted) {
                setIsLoadingReference(false);
            }
        }

        return () => {
            controller.abort();
        };
    };

    const getTemplateData = () => {
        // If using IDs, provide the ID template data
        if (importMethod === 'ids') {
            return [
                ["registration_no", "make", "model", "year", "chassis_no", "engine_no", "body_type_id", "category_id", "vehicle_type_id", "client_id", "seating_capacity", "cubic_capacity", "gross_weight"],
                ["UBC123D", "Toyota", "Corolla", 2022, "JTDZS3EU0E3298500", "2ZR-3298500", bodyTypes[0]?.id || "body_type_id", vehicleCategories[0]?.id || "category_id", vehicleTypes[0]?.id || "vehicle_type_id", clients[0]?.id || clientId || "client_id", 5, 1800, 1500],
                ["UBE456F", "Honda", "Civic", 2021, "HDZS3EU0E3298501", "2FG-3298501", bodyTypes[1]?.id || bodyTypes[0]?.id || "body_type_id", vehicleCategories[1]?.id || vehicleCategories[0]?.id || "category_id", vehicleTypes[1]?.id || vehicleTypes[0]?.id || "vehicle_type_id", clients[1]?.id || clients[0]?.id || clientId || "client_id", 5, 1600, 1400]
            ];
        }

        // Otherwise use the names template
        return TEMPLATE_DATA;
    };

    const downloadTemplate = () => {
        // Create a new workbook
        const wb = XLSX.utils.book_new();

        // Create a worksheet from the template data
        const ws = XLSX.utils.aoa_to_sheet(getTemplateData());

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, "Vehicles");

        // Generate XLSX file and trigger download
        XLSX.writeFile(wb, `vehicle_import_template_${importMethod}.xlsx`);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();

            if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
                toast.error("Please upload an Excel file (.xlsx or .xls)");
                return;
            }
            setFile(selectedFile);
            processExcelFile(selectedFile);
        }
    };

    // Process Excel file to generate preview data
    const processExcelFile = async (file: File) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            // Convert to JSON for preview
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Get headers from the first row
            const headers = Object.keys(jsonData[0] || {});

            // Limit preview to first 10 rows (increased from 5)
            const previewRows = jsonData.slice(0, 10);

            setPreviewHeaders(headers);
            setPreviewData(previewRows);
        } catch (error) {
            console.error("Error processing Excel file:", error);
            toast.error("Failed to process the Excel file");
        }
    };

    // Handle next button click to proceed to data review
    const handleNextStep = () => {
        if (currentStep === 'file-selection' && file) {
            setCurrentStep('data-review');
        }
    };

    // Handle back button click to return to file selection
    const handlePreviousStep = () => {
        if (currentStep === 'data-review') {
            setCurrentStep('file-selection');
        }
    };

    // Reference to the file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Trigger file input click
    const handleSelectFileClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
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
            const fileExtension = droppedFile.name.split('.').pop()?.toLowerCase();

            if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
                toast.error("Please upload an Excel file (.xlsx or .xls)");
                return;
            }
            setFile(droppedFile);
            processExcelFile(droppedFile);
        }
    };

    // Effect to handle progress updates
    useEffect(() => {
        let progressInterval: NodeJS.Timeout;

        if (isProgressActive) {
            progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        return prev;
                    }
                    return prev + 10;
                });
            }, 500);
        }

        return () => {
            if (progressInterval) {
                clearInterval(progressInterval);
            }
        };
    }, [isProgressActive]);

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file to upload");
            return;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);
            setUploadResult(null);
            setIsProgressActive(true);

            // Convert Excel file to CSV for backend compatibility
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const csvContent = XLSX.utils.sheet_to_csv(worksheet);

            // Create a new File object with CSV content
            const csvFile = new File([csvContent], 'converted.csv', { type: 'text/csv' });

            // Create FormData object
            const formData = new FormData();
            formData.append('file', csvFile);
            formData.append('importMethod', importMethod);

            if (clientId) {
                formData.append('clientId', clientId);
            }

            // Add reference data maps for name-to-id conversion on the server
            if (importMethod === 'names') {
                formData.append('bodyTypesMap', JSON.stringify(bodyTypes));
                formData.append('vehicleCategoriesMap', JSON.stringify(vehicleCategories));
                formData.append('vehicleTypesMap', JSON.stringify(vehicleTypes));
                formData.append('clientsMap', JSON.stringify(clients));
            }

            // Make the API call
            const response = await fetch('/api/vehicles/bulk-upload', {
                method: 'POST',
                body: formData,
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                },
            });

            setIsProgressActive(false);
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
            setIsProgressActive(false);
            setIsUploading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setUploadResult(null);
        setUploadProgress(0);
        setCurrentStep('file-selection');
        setPreviewData([]);
        setPreviewHeaders([]);
    };

    const handleClose = () => {
        setOpen(false);
        resetForm();
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                // Only allow closing through explicit button clicks
                if (open && !newOpen) {
                    return;
                }
                setOpen(newOpen);
                if (!newOpen) {
                    resetForm();
                }
            }}
            modal={true}>
            <DialogTrigger asChild onClick={(e) => {
                console.log("Import button clicked");
                e.preventDefault(); // Prevent default behavior
                setOpen(true);
            }}>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full border-green-200 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-950/20"
                                aria-label="Import vehicles"
                                type="button"
                                onClick={(e) => {
                                    console.log("Icon button clicked");
                                    e.stopPropagation();
                                    setOpen(true);
                                }}
                            >
                                <Upload className="h-4 w-4 text-green-600" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                            Import vehicles
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] max-h-[95vh] h-[calc(100vh-80px)] xl:max-w-[1000px] lg:max-w-[850px] md:max-w-[750px] p-0 overflow-hidden fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 z-50 bg-background shadow-lg border rounded-lg">
                <div className="flex h-full">
                    {/* Steps sidebar */}
                    <div className="w-[160px] bg-muted p-3 border-r">
                        <h3 className="text-xs font-semibold mb-3">Import Steps</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${currentStep === 'file-selection' ? 'bg-green-600 text-white' : 'bg-muted-foreground/20'}`}>
                                    1
                                </div>
                                <span className={`text-xs ${currentStep === 'file-selection' ? 'font-medium' : 'text-muted-foreground'}`}>
                                    Import File
                                </span>
                            </li>
                            <li className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${currentStep === 'data-review' ? 'bg-green-600 text-white' : 'bg-muted-foreground/20'}`}>
                                    2
                                </div>
                                <span className={`text-xs ${currentStep === 'data-review' ? 'font-medium' : 'text-muted-foreground'}`}>
                                    Review Data
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Main content area */}
                    <div className="flex-1 overflow-hidden flex flex-col h-full">
                        <DialogHeader className="px-4 pt-3 pb-2 shrink-0">
                            <DialogTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                {currentStep === 'file-selection' ? 'Select Import File' : 'Review Import Data'}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex-1 overflow-auto px-4 py-2 min-h-0">
                            {!uploadResult ? (
                                <>
                                    {/* File Selection Step */}
                                    {currentStep === 'file-selection' && (
                                        <div className="space-y-2">
                                            <div
                                                className={`border-2 border-dashed rounded-lg p-4 transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20"
                                                    } ${file ? "bg-muted/20" : ""}`}
                                                onDragEnter={handleDrag}
                                                onDragOver={handleDrag}
                                                onDragLeave={handleDrag}
                                                onDrop={handleDrop}
                                            >
                                                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                                                    <div className="flex items-center justify-center h-9 w-9 rounded-full bg-muted">
                                                        <Upload className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    {!file ? (
                                                        <>
                                                            <div className="flex flex-col space-y-1">
                                                                <p className="text-xs font-medium">Drag & drop your Excel file here</p>
                                                                <p className="text-[10px] text-muted-foreground">
                                                                    or click to browse files
                                                                </p>
                                                            </div>

                                                            <input
                                                                ref={fileInputRef}
                                                                type="file"
                                                                accept=".xlsx,.xls"
                                                                className="hidden"
                                                                onChange={handleFileChange}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="cursor-pointer"
                                                                onClick={handleSelectFileClick}
                                                            >
                                                                Select File
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center space-y-1">
                                                            <FileCheck className="h-5 w-5 text-green-600" />
                                                            <p className="text-sm font-medium">{file.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {(file.size / 1024).toFixed(1)} KB
                                                            </p>
                                                            <div className="flex gap-2 mt-1">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setFile(null)}
                                                                >
                                                                    Remove
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={handleNextStep}
                                                                    disabled={!file}
                                                                    className="gap-1"
                                                                >
                                                                    Next <ArrowRight className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {referenceDataError && (
                                                <Alert variant="destructive">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertTitle>Error loading data</AlertTitle>
                                                    <AlertDescription className="text-xs">
                                                        Failed to load reference data. Try again later.
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            <div className="grid grid-cols-1 gap-2">
                                                <div>
                                                    <div className="text-xs font-medium mb-1">Import method</div>
                                                    <RadioGroup
                                                        defaultValue="names"
                                                        value={importMethod}
                                                        onValueChange={(value) => setImportMethod(value as 'names' | 'ids')}
                                                        className="flex space-x-4"
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="names" id="names" />
                                                            <Label htmlFor="names" className="text-xs">Use entity names</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="ids" id="ids" />
                                                            <Label htmlFor="ids" className="text-xs">Use entity IDs</Label>
                                                        </div>
                                                    </RadioGroup>

                                                    <div className="text-[10px] text-muted-foreground mt-1">
                                                        {importMethod === 'names'
                                                            ? "The system will match vehicle types, body types, categories and clients by their names"
                                                            : "You'll need to provide precise entity IDs in your import file"}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2 mt-3 border rounded-lg p-3 bg-muted/30">
                                                    <div className="flex items-center gap-2">
                                                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                                        <span className="text-xs font-medium">Download Template</span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        Download an Excel template with the correct format for importing vehicles.
                                                        {importMethod === 'names'
                                                            ? " Uses friendly names for vehicle types, categories, etc."
                                                            : " Uses system IDs for precise data mapping."}
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full border-green-200 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-950/20 gap-2"
                                                        onClick={downloadTemplate}
                                                        disabled={isLoadingReference}
                                                    >
                                                        {isLoadingReference ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Download className="h-3.5 w-3.5 text-green-600" />
                                                        )}
                                                        Download {importMethod === 'names' ? 'Name-Based' : 'ID-Based'} Template
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Data Review Step */}
                                    {currentStep === 'data-review' && (
                                        <div className="space-y-4">
                                            <Alert className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                                                <Info className="h-4 w-4 text-blue-600" />
                                                <AlertTitle className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                                    Data Preview
                                                </AlertTitle>
                                                <AlertDescription className="text-[10px] text-blue-600 dark:text-blue-400">
                                                    Review data before importing. Scroll horizontally if needed. Hover for full content.
                                                </AlertDescription>
                                            </Alert>

                                            <div className="text-[10px] text-muted-foreground">
                                                Showing {previewData.length} of {file ? 'the total' : '0'} records in the file. First 10 rows are displayed for preview.
                                            </div>

                                            <div className="w-[800px] border rounded-md overflow-hidden">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-[10px] border-collapse">
                                                        <thead className="bg-muted text-[10px] sticky top-0 z-10">
                                                            <tr>
                                                                {previewHeaders.map((header, index) => {
                                                                    const width = header === "chassis_no" || header === "engine_no"
                                                                        ? "w-[120px]"
                                                                        : header === "year"
                                                                            ? "w-[50px]"
                                                                            : header === "registration_no"
                                                                                ? "w-[80px]"
                                                                                : header === "make" || header === "model"
                                                                                    ? "w-[60px]"
                                                                                    : "w-[70px]";

                                                                    return (
                                                                        <th key={index} className="px-1.5 py-1.5 text-left font-medium whitespace-nowrap border-b bg-muted/80">
                                                                            <div className={`truncate ${width}`}>{header}</div>
                                                                        </th>
                                                                    );
                                                                })}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {paginatedData.map((row, rowIndex) => (
                                                                <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-muted/10" : ""}>
                                                                    {previewHeaders.map((header, colIndex) => {
                                                                        const cellValue = row[header] !== undefined ? String(row[header]) : '-';
                                                                        const width = header === "chassis_no" || header === "engine_no"
                                                                            ? "w-[120px]"
                                                                            : header === "year"
                                                                                ? "w-[50px]"
                                                                                : header === "registration_no"
                                                                                    ? "w-[80px]"
                                                                                    : header === "make" || header === "model"
                                                                                        ? "w-[60px]"
                                                                                        : "w-[70px]";

                                                                        return (
                                                                            <td key={`${rowIndex}-${colIndex}`} className="px-1.5 py-1 border-b border-muted-foreground/10">
                                                                                <div className={`truncate ${width}`} title={cellValue}>
                                                                                    {cellValue}
                                                                                </div>
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                {previewData.length === 0 && (
                                                    <div className="p-4 text-center text-muted-foreground text-[10px]">
                                                        No data to preview
                                                    </div>
                                                )}
                                                {previewData.length > 0 && (
                                                    <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/50">
                                                        <div className="text-[10px] text-muted-foreground">
                                                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, previewData.length)} of {previewData.length} records
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={goToPreviousPage}
                                                                disabled={currentPage === 1}
                                                            >
                                                                <ChevronLeft className="h-3 w-3" />
                                                            </Button>
                                                            <div className="text-[10px] w-12 text-center">
                                                                {currentPage} / {totalPages}
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={goToNextPage}
                                                                disabled={currentPage === totalPages}
                                                            >
                                                                <ChevronRight className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <Alert variant={uploadResult.failed > 0 ? "destructive" : "default"}>
                                        <div className="flex gap-2">
                                            {uploadResult.failed > 0 ? (
                                                <AlertCircle className="h-4 w-4" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4" />
                                            )}
                                            <AlertTitle className="text-xs">Upload {uploadResult.failed === 0 ? "Complete" : "Completed with Errors"}</AlertTitle>
                                        </div>
                                        <AlertDescription className="mt-1 text-[10px]">
                                            <p>Successfully uploaded {uploadResult.success} vehicles</p>
                                            {uploadResult.failed > 0 && (
                                                <p>Failed to upload {uploadResult.failed} vehicles</p>
                                            )}
                                        </AlertDescription>
                                    </Alert>

                                    {uploadResult.errors && uploadResult.errors.length > 0 && (
                                        <Card>
                                            <CardContent className="pt-3 px-3 max-h-[350px] overflow-y-auto">
                                                <h4 className="text-xs font-medium mb-1">Errors:</h4>
                                                <ul className="text-[10px] space-y-1 text-muted-foreground list-disc pl-4">
                                                    {uploadResult.errors.map((error, index) => (
                                                        <li key={index}>{error}</li>
                                                    ))}
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    )}

                                    <div className="flex justify-end">
                                        {uploadResult.failed > 0 && (
                                            <Button type="button" onClick={resetForm}>
                                                Try Again
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {isUploading && (
                                <div className="space-y-3">
                                    <p className="text-xs font-medium text-center">Uploading vehicles...</p>
                                    <div className="bg-green-100 dark:bg-green-950/40 rounded-full overflow-hidden">
                                        <Progress value={uploadProgress} className="h-2 [&>div]:bg-green-600" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground text-center">
                                        This may take a few minutes for large files
                                    </p>
                                </div>
                            )}
                        </div>

                        {!uploadResult && !isUploading && (
                            <DialogFooter className="px-4 py-3 border-t mt-auto shrink-0">
                                {currentStep === 'file-selection' ? (
                                    <div className="flex justify-end w-full">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClose}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex justify-between w-full">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handlePreviousStep}
                                            className="gap-1"
                                        >
                                            <ArrowLeft className="h-3.5 w-3.5" /> Back
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={handleUpload}
                                            disabled={!file}
                                            className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                                        >
                                            {isUploading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                                            Import Vehicles
                                        </Button>
                                    </div>
                                )}
                            </DialogFooter>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 