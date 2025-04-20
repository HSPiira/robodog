"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VehicleImportPreviewProps {
    data: any[];
    issues: any[];
}

export function VehicleImportPreview({ data, issues }: VehicleImportPreviewProps) {
    if (!data.length) {
        return (
            <div className="text-center p-6">
                <p className="text-muted-foreground">No data to preview</p>
            </div>
        );
    }

    // Function to check if a row has issues
    const hasRowIssues = (rowIndex: number) => {
        return issues.some(issue => issue.rowIndex === rowIndex);
    };

    // Get the issues for a specific field in a row
    const getFieldIssues = (rowIndex: number, field: string) => {
        return issues.filter(
            issue => issue.rowIndex === rowIndex && issue.field === field
        );
    };

    // Get all the column keys from the first data row
    const columns = Object.keys(data[0] || {});

    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]">#</TableHead>
                            {columns.map(column => (
                                <TableHead key={column} className="min-w-[120px]">
                                    {column.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </TableHead>
                            ))}
                            <TableHead className="w-[80px]">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, rowIndex) => (
                            <TableRow
                                key={rowIndex}
                                className={hasRowIssues(rowIndex) ? "bg-red-50/50 dark:bg-red-900/10" : ""}
                            >
                                <TableCell className="font-medium">{rowIndex + 1}</TableCell>
                                {columns.map(column => {
                                    const fieldIssues = getFieldIssues(rowIndex, column);
                                    const hasIssue = fieldIssues.length > 0;

                                    return (
                                        <TableCell
                                            key={`${rowIndex}-${column}`}
                                            className={hasIssue ? "text-red-600 dark:text-red-400" : ""}
                                        >
                                            <div className="flex items-center">
                                                {hasIssue && (
                                                    <div className="relative group mr-1.5">
                                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                                        <div className="absolute left-0 -top-1 -translate-y-full invisible group-hover:visible bg-black text-white text-xs rounded p-2 w-48 z-10">
                                                            {fieldIssues.map((issue, i) => (
                                                                <p key={i}>{issue.message}</p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {/* For mapped fields, show both original and mapped value */}
                                                {row[`${column}Original`] && row[`${column}Original`] !== row[column] ? (
                                                    <div>
                                                        <span className="line-through text-muted-foreground mr-1.5">
                                                            {row[`${column}Original`]}
                                                        </span>
                                                        <span className="text-primary font-medium">
                                                            {row[column]}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span>{row[column] || "-"}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                    );
                                })}
                                <TableCell>
                                    {hasRowIssues(rowIndex) ? (
                                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                                            Invalid
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs px-1.5 py-0.5 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                                            Valid
                                        </Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="p-3 border-t bg-muted/30">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {data.length} vehicles
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1.5" />
                            <span>
                                {data.length - issues.filter((v, i, a) => a.findIndex(t => t.rowIndex === v.rowIndex) === i).length} Valid
                            </span>
                        </div>
                        <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-red-500 mr-1.5" />
                            <span>
                                {issues.filter((v, i, a) => a.findIndex(t => t.rowIndex === v.rowIndex) === i).length} With Issues
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 