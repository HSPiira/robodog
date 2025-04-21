"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MappingIssuesDialogProps {
    issues: {
        rowIndex: number;
        field: string;
        value: string;
        message: string;
        type: string;
    }[];
}

export function MappingIssuesDialog({ issues }: MappingIssuesDialogProps) {
    // Group issues by type
    const issuesByType = issues.reduce((acc, issue) => {
        if (!acc[issue.type]) {
            acc[issue.type] = [];
        }
        acc[issue.type].push(issue);
        return acc;
    }, {} as Record<string, typeof issues>);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {issues.length} Issue{issues.length !== 1 ? "s" : ""}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Import Issues</DialogTitle>
                    <DialogDescription>
                        The following issues must be resolved before importing
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 mt-4">
                    <div className="space-y-6 pr-4">
                        {Object.entries(issuesByType).map(([type, typeIssues]) => (
                            <div key={type} className="space-y-3">
                                <h3 className="font-semibold text-sm">
                                    {type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Issues
                                </h3>
                                <div className="space-y-2">
                                    {typeIssues.map((issue, index) => (
                                        <div
                                            key={index}
                                            className="border rounded-md p-3 bg-red-50/50 dark:bg-red-900/10"
                                        >
                                            <div className="flex items-start">
                                                <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        Row {issue.rowIndex + 1}: {issue.message}
                                                    </p>
                                                    <div className="mt-1 flex flex-wrap gap-2">
                                                        <div className="text-xs bg-background rounded border px-2 py-1">
                                                            <span className="font-medium">Field:</span> {issue.field}
                                                        </div>
                                                        <div className="text-xs bg-background rounded border px-2 py-1">
                                                            <span className="font-medium">Value:</span> {issue.value || "(empty)"}
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 text-xs text-muted-foreground">
                                                        {type === "unknownValue" && (
                                                            <p>
                                                                This value could not be mapped to an existing {issue.field}.
                                                                Try using a different name or use the exact ID.
                                                            </p>
                                                        )}
                                                        {type === "missingRequired" && (
                                                            <p>
                                                                This field is required. Please provide a valid value.
                                                            </p>
                                                        )}
                                                        {type === "invalidFormat" && (
                                                            <p>
                                                                The value is not in the correct format. Please check the requirements.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        To resolve these issues:
                        <ul className="list-disc ml-5 mt-1 space-y-1">
                            <li>Edit your spreadsheet file to correct the values</li>
                            <li>Re-upload the corrected file</li>
                            <li>Or use exact IDs from the system instead of names</li>
                        </ul>
                    </p>
                    <div className="flex justify-end">
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <X className="h-4 w-4 mr-2" />
                                Close
                            </Button>
                        </DialogTrigger>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 