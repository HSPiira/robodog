"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as XLSX from "xlsx";

interface UploadStockFormProps {
    trigger: React.ReactNode;
    onStockUploaded?: () => void;
}

interface ExcelRow {
    serialNumber: string;
    stickerType: string;
    insurer: string;
    receivedAt: string | number | Date;  // Update type to handle Excel date formats
}

export function UploadStockForm({ trigger, onStockUploaded }: UploadStockFormProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const downloadTemplate = () => {
        // Create a workbook with a single sheet
        const workbook = XLSX.utils.book_new();

        // Get today's and tomorrow's dates
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Format dates as strings in DD/MM/YYYY format for the template
        const formatDate = (date: Date) => {
            return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        };

        // Create sample data
        const data = [
            {
                serialNumber: "STK123456",
                stickerType: "Type A",
                insurer: "Insurer X",
                receivedAt: formatDate(today)
            },
            {
                serialNumber: "STK123457",
                stickerType: "Type B",
                insurer: "Insurer Y",
                receivedAt: formatDate(tomorrow)
            }
        ];

        // Convert data to worksheet
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Add column headers with format instructions
        XLSX.utils.sheet_add_aoa(worksheet, [[
            "Serial Number (Required)",
            "Sticker Type (Required)",
            "Insurer (Required)",
            "Received Date (Required, use Excel's date picker or enter as DD/MM/YYYY)"
        ]], { origin: "A1" });

        // Set column widths
        const wscols = [
            { wch: 15 }, // Serial Number
            { wch: 15 }, // Sticker Type
            { wch: 15 }, // Insurer
            { wch: 20 }, // Received Date
        ];
        worksheet['!cols'] = wscols;

        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

        // Generate Excel file
        XLSX.writeFile(workbook, "sticker-stock-template.xlsx");
    };

    const validateExcel = (data: ExcelRow[]): string[] => {
        const errors: string[] = [];
        const dateFormatErrors: number[] = [];

        data.forEach((row, index) => {
            if (!row.serialNumber) {
                errors.push(`Row ${index + 1}: Serial number is required`);
            }
            if (!row.stickerType) {
                errors.push(`Row ${index + 1}: Sticker type is required`);
            }
            if (!row.insurer) {
                errors.push(`Row ${index + 1}: Insurer is required`);
            }
            if (!row.receivedAt) {
                errors.push(`Row ${index + 1}: Received date is required`);
            } else {
                try {
                    let dateValue = row.receivedAt;
                    let date: Date;

                    // Handle different date formats
                    if (typeof dateValue === 'number') {
                        // Excel dates are number of days since 1900-01-01 (or 1904-01-01)
                        const excelEpoch = new Date(1899, 11, 30); // Excel's epoch (1900-01-01 minus 1 day)
                        date = new Date(excelEpoch);
                        date.setDate(date.getDate() + dateValue);
                    } else if (dateValue instanceof Date) {
                        date = dateValue;
                    } else if (typeof dateValue === 'string') {
                        // Try parsing as DD/MM/YYYY first
                        const parts = dateValue.split('/');
                        if (parts.length === 3) {
                            const [day, month, year] = parts.map(p => parseInt(p, 10));
                            date = new Date(year, month - 1, day);
                        } else {
                            // Fallback to standard date parsing
                            date = new Date(dateValue);
                        }
                    } else {
                        throw new Error('Invalid date format');
                    }

                    if (isNaN(date.getTime())) {
                        dateFormatErrors.push(index + 1);
                    } else {
                        const year = date.getFullYear();
                        if (year < 2000 || year > 2100) {
                            dateFormatErrors.push(index + 1);
                        } else {
                            // Store in YYYY-MM-DD format for the database
                            const month = (date.getMonth() + 1).toString().padStart(2, '0');
                            const day = date.getDate().toString().padStart(2, '0');
                            row.receivedAt = `${year}-${month}-${day}`;
                        }
                    }
                } catch (error) {
                    console.error(`Error processing date at row ${index + 1}:`, error);
                    dateFormatErrors.push(index + 1);
                }
            }
        });

        // If there are date format errors, add a single clear message
        if (dateFormatErrors.length > 0) {
            const today = new Date();
            const exampleDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
            errors.push(
                `The following rows have incorrect date format: ${dateFormatErrors.join(', ')}. ` +
                `Please ensure all dates are valid and in DD/MM/YYYY format (e.g., ${exampleDate}). ` +
                `You can either enter dates manually in DD/MM/YYYY format or use Excel's date picker.`
            );
        }

        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        try {
            console.log("Reading Excel file");
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer);
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json<ExcelRow>(firstSheet);

            // Log the parsed data for debugging
            console.log("Parsed Excel data:", data);

            // Validate the data structure
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error("The Excel file must contain at least one row of data");
            }

            // Check for required columns
            const firstRow = data[0];
            const requiredColumns = ['serialNumber', 'stickerType', 'insurer', 'receivedAt'];
            const missingColumns = requiredColumns.filter(col => !(col in firstRow));

            if (missingColumns.length > 0) {
                throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
            }

            const validationErrors = validateExcel(data);
            if (validationErrors.length > 0) {
                throw new Error(validationErrors.join('\n\n'));
            }

            console.log("Sending data to server");
            const response = await fetch("/api/stickers/stock/upload", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();
            console.log("Server response:", responseData);

            if (!response.ok) {
                throw new Error(responseData.error || `Failed to upload stock: ${response.status} ${response.statusText}`);
            }

            toast({
                title: "Success",
                description: `Successfully uploaded ${responseData.created} stock items. ${responseData.skipped} items were skipped due to duplicate serial numbers.`,
            });
            setOpen(false);
            setFile(null);
            onStockUploaded?.();
        } catch (error) {
            console.error("Error uploading stock:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to upload stock",
                variant: "destructive",
                duration: 10000, // Show for 10 seconds
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload Stock</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="file">Excel File</Label>
                        <Input
                            id="file"
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            required
                        />
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                                Upload an Excel file with the following columns:
                            </p>
                            <ul className="text-sm text-muted-foreground list-disc pl-4">
                                <li>serialNumber (Required)</li>
                                <li>stickerType (Required)</li>
                                <li>insurer (Required)</li>
                                <li>receivedAt (Required, Format: DD/MM/YYYY)</li>
                            </ul>
                            <p className="text-sm text-muted-foreground mt-2">
                                Example date format: {new Date().getDate().toString().padStart(2, '0')}/{(new Date().getMonth() + 1).toString().padStart(2, '0')}/{new Date().getFullYear()}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={downloadTemplate}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download Template
                        </Button>
                        <Button type="submit" disabled={loading || !file} className="flex-1">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Stock
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 