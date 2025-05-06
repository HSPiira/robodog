"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
    Car,
    FileText,
    Building2,
    Calendar,
    MoreHorizontal,
    Tag,
    Sticker,
    X,
    Trash2,
    Loader2,
    User,
    Printer,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StickerWithRelations {
    id: string;
    serialNumber: string;
    createdAt: Date;
    issuedAt: Date;
    validFrom: Date;
    validTo: Date;
    vehicle: {
        registrationNo: string;
        client?: {
            id?: string;
            name: string;
        };
    };
    policy?: {
        policyNo: string;
        client?: {
            id?: string;
            name: string;
        };
    } | null;
    stock: {
        serialNumber: string;
        stickerType: {
            name: string;
        };
        insurer: {
            name: string;
        };
    };
    issuedByUser?: {
        name: string;
    };
    isActive: boolean;
}

interface StickerDetailProps {
    sticker: StickerWithRelations;
    onClose?: () => void;
    onDelete: () => void;
}

export function StickerDetail({
    sticker,
    onClose,
    onDelete,
}: StickerDetailProps) {
    console.log('StickerDetail received sticker:', sticker);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showPrintPreview, setShowPrintPreview] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/sticker-issuance/${sticker.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete sticker");
            }

            toast.success("Sticker deleted successfully");
            onDelete();
        } catch (error) {
            console.error("Error deleting sticker:", error);
            toast.error("Failed to delete sticker");
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    return (
        <>
            {/* Print Preview Modal */}
            <Dialog open={showPrintPreview} onOpenChange={setShowPrintPreview}>
                <DialogContent className="max-w-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg print:hidden">Sticker Print Preview</DialogTitle>
                    </DialogHeader>

                    {/* This entire section will NOT be printed */}
                    <div className="print:hidden">
                        <div className="bg-white border border-yellow-900 p-3 w-[600px] mx-auto relative" style={{ fontFamily: 'serif', fontSize: '13px' }}>
                            <div className="flex items-center justify-between mb-0.5">
                                {/* QR Code Placeholder */}
                                <div className="w-14 h-14 bg-gray-200 flex items-center justify-center text-xs rounded">QR</div>
                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <div className="font-bold text-base tracking-wide">THE REPUBLIC OF UGANDA</div>
                                    <div className="text-red-600 font-bold text-xs tracking-wide">MOTOR PRIVATE</div>
                                    <div className="font-bold text-sm mt-0">MTP CERTIFICATE OF INSURANCE</div>
                                </div>
                                <div className="flex flex-col items-end ml-2">
                                    <div className="border border-black px-2 py-0.5 font-bold text-sm bg-gray-50 tracking-widest rounded">{sticker.serialNumber}</div>
                                    <div className="mt-0.5 w-16 h-5 bg-gray-100 border border-gray-400 flex items-center justify-center text-[8px] rounded">Car Img</div>
                                </div>
                            </div>
                            <hr className="my-1 border-black" />
                            <table className="w-full text-[11px] mb-0">
                                <tbody>
                                    <tr>
                                        <td className="font-mono align-top py-0 whitespace-nowrap text-left">Name of Policyholder:</td>
                                        <td className="font-bold align-top py-0 text-left">{sticker.policy?.client?.name || sticker.vehicle.client?.name || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-mono align-top py-0 whitespace-nowrap text-left">Policy No.:</td>
                                        <td className="font-bold align-top py-0 text-left">{sticker.policy?.policyNo || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-mono align-top py-0 whitespace-nowrap text-left">Reg. No. & Make:</td>
                                        <td className="font-bold align-top py-0 text-left">{sticker.vehicle.registrationNo} {sticker.stock.stickerType.name}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-mono align-top py-0 whitespace-nowrap text-left">Seating Capacity:</td>
                                        <td className="font-bold align-top py-0 text-left">-</td>
                                    </tr>
                                    <tr>
                                        <td className="font-mono align-top py-0 whitespace-nowrap text-left">Gross Weight:</td>
                                        <td className="font-bold align-top py-0 text-left">-</td>
                                    </tr>
                                    <tr>
                                        <td className="font-mono align-top py-0 whitespace-nowrap text-left">Chassis No.:</td>
                                        <td className="font-bold align-top py-0 text-left">-</td>
                                    </tr>
                                    <tr>
                                        <td className="font-mono align-top py-0 whitespace-nowrap text-left">Premium Charged:</td>
                                        <td className="font-bold align-top py-0 text-left">-</td>
                                    </tr>
                                    <tr>
                                        <td className="font-mono align-top py-0 whitespace-nowrap text-left">Start Date/Time:</td>
                                        <td className="font-bold align-top py-0 text-left">{sticker.validFrom ? format(new Date(sticker.validFrom), "dd/MM/yyyy") : "-"} 00:00 Hrs</td>
                                    </tr>
                                    <tr>
                                        <td className="font-mono align-top py-0 whitespace-nowrap text-left">End Date/Time:</td>
                                        <td className="font-bold align-top py-0 text-left">{sticker.validTo ? format(new Date(sticker.validTo), "dd/MM/yyyy") : "-"} 00:00 Hrs</td>
                                    </tr>
                                    <tr>
                                        <td className="font-mono align-top py-0 whitespace-nowrap text-left">Issuing Company:</td>
                                        <td className="font-bold align-top py-0 text-left">{sticker.stock.insurer.name}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-mono align-top py-0 whitespace-nowrap text-left">Issuing Officer:</td>
                                        <td className="font-bold align-top py-0 text-left">{sticker.issuedByUser?.name || "-"}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="absolute right-4 bottom-4 text-red-700 font-bold text-sm">VALID FOR 12 MONTHS</div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <Button onClick={() => window.print()} variant="outline">Print</Button>
                        </div>
                    </div>

                    {/* This will ONLY appear when printing */}
                    <div className="hidden print:block font-mono text-[13px] pl-2">
                        <div>{sticker.policy?.client?.name || sticker.vehicle.client?.name || "-"}</div>
                        <div>{sticker.policy?.policyNo || "-"}</div>
                        <div>{sticker.vehicle.registrationNo} {sticker.stock.stickerType.name}</div>
                        <div>-</div>
                        <div>-</div>
                        <div>-</div>
                        <div>-</div>
                        <div>{sticker.validFrom ? format(new Date(sticker.validFrom), "dd/MM/yyyy") : "-"} 00:00 Hrs</div>
                        <div>{sticker.validTo ? format(new Date(sticker.validTo), "dd/MM/yyyy") : "-"} 00:00 Hrs</div>
                        <div>{sticker.stock.insurer.name}</div>
                        <div>{sticker.issuedByUser?.name || "-"}</div>
                    </div>
                </DialogContent>
            </Dialog>
            <Card className="h-full shadow-sm">
                <CardHeader className="border-b pb-2.5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="w-7 h-7 rounded-full bg-blue-500/15 flex items-center justify-center mr-2">
                                <Sticker className="h-3.5 w-3.5 text-blue-500" />
                            </div>
                            <CardTitle className="text-base whitespace-nowrap">
                                {sticker.serialNumber}
                                {sticker.isActive ? (
                                    <span className="ml-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                        Active
                                    </span>
                                ) : (
                                    <span className="ml-2 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                        Expired
                                    </span>
                                )}
                            </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel className="text-xs">Sticker Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="gap-2 text-xs text-destructive cursor-pointer"
                                        onClick={() => setShowDeleteDialog(true)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Delete sticker
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={onClose}
                            >
                                <X className="h-4 w-4" />
                            </Button>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => setShowPrintPreview(true)}
                                            aria-label="Print Preview"
                                        >
                                            <Printer className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Print Preview</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-3">
                    <div className="space-y-4">
                        {/* Main details */}
                        <div className="pb-2.5 border-b">
                            <div className="flex items-center mb-1.5">
                                <Tag className="h-3.5 w-3.5 text-purple-500 mr-1.5 flex-shrink-0" />
                                <h3 className="font-medium text-sm">
                                    {sticker.stock.stickerType.name}
                                </h3>
                            </div>
                            <div className="space-y-1 pl-5">
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3 mr-1 text-orange-500 flex-shrink-0" />
                                    Issued on {format(new Date(sticker.issuedAt), "dd MMM yyyy, HH:mm")}
                                </div>
                                {sticker.issuedByUser?.name && (
                                    <div className="flex items-center text-xs text-muted-foreground pl-5 font-semibold">
                                        <User className="h-3 w-3 mr-1 text-blue-500 flex-shrink-0" />
                                        <span className="mr-1">Issued by</span>
                                        <span className="font-medium">{sticker.issuedByUser.name}</span>
                                    </div>
                                )}
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3 mr-1 text-orange-500 flex-shrink-0" />
                                    Valid from <span className="font-medium ml-1">{sticker.validFrom ? format(new Date(sticker.validFrom), "dd MMM yyyy") : "N/A"}</span> <span className="mx-2">To</span> <span className="font-medium">{sticker.validTo ? format(new Date(sticker.validTo), "dd MMM yyyy") : "N/A"}</span>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Building2 className="h-3 w-3 mr-1 text-emerald-500 flex-shrink-0" />
                                    {sticker.stock.insurer.name}
                                </div>
                            </div>
                        </div>

                        {/* Vehicle & Policy Details */}
                        <div>
                            <div className="space-y-1">
                                <div className="flex items-center text-xs">
                                    <Car className="h-3 w-3 mr-1 text-blue-500 flex-shrink-0" />
                                    <span className="text-muted-foreground">Vehicle:</span>
                                    <span className="ml-1 font-medium">{sticker.vehicle.registrationNo}</span>
                                </div>
                                {sticker.policy && (
                                    <>
                                        <div className="flex items-center text-xs">
                                            <FileText className="h-3 w-3 mr-1 text-violet-500 flex-shrink-0" />
                                            <span className="text-muted-foreground">Policy:</span>
                                            <span className="ml-1 font-medium">{sticker.policy.policyNo}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            {/* Client Details Section - always visible if client exists */}
                            {(sticker.vehicle.client || sticker.policy?.client) && (
                                <div className="mt-3 pl-2 border-l-2 border-muted-foreground/20">
                                    <div className="flex items-center text-xs font-semibold mb-1 text-muted-foreground">
                                        Client Details
                                    </div>
                                    <div className="flex items-center text-xs">
                                        <span className="text-muted-foreground">Name:</span>
                                        <span className="ml-1 font-medium">{sticker.vehicle.client?.name || sticker.policy?.client?.name}</span>
                                    </div>
                                    {sticker.vehicle.client?.id && (
                                        <div className="flex items-center text-xs">
                                            <span className="text-muted-foreground">ID:</span>
                                            <span className="ml-1 font-mono">{sticker.vehicle.client.id}</span>
                                        </div>
                                    )}
                                    {!sticker.vehicle.client?.id && sticker.policy?.client?.id && (
                                        <div className="flex items-center text-xs">
                                            <span className="text-muted-foreground">ID:</span>
                                            <span className="ml-1 font-mono">{sticker.policy.client.id}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Sticker</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this sticker? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
} 