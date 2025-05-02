"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Car, CheckCircle, Copy, Edit, ExternalLink, MoreHorizontal, Shield, Trash2, User, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { DeleteStickerDialog } from "./delete-sticker-dialog";
import {
    Copy as CopyIcon,
    ExternalLink as ExternalLinkIcon,
    Building2,
    FileText,
    Sticker,
    X,
    Loader2,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface StickerDetailProps {
    sticker?: {
        id: string;
        stickerNo: string;
        policyNo: string;
        registrationNo: string;
        bureau: "COMESA" | "KENYA";
        status: "active" | "inactive";
        client: {
            id: string;
            name: string;
        };
        vehicle: {
            id: string;
            registrationNo: string;
            type: string;
        };
        createdAt: string;
        updatedAt: string;
        issuedAt: string;
        stock: {
            serialNumber: string;
            stickerType: {
                name: string;
            };
            insurer: {
                name: string;
            };
        };
    };
    onRefresh?: () => void;
    onClose?: () => void;
    onDelete: () => void;
}

export function StickerDetail({ sticker, onRefresh, onClose, onDelete }: StickerDetailProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Get color based on bureau
    const getBureauColor = (bureau: string) => {
        switch (bureau.toUpperCase()) {
            case "COMESA": return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
            case "KENYA": return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300";
            default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    // Get status color
    const getStatusColor = (status: string) => {
        return status === "active"
            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
    };

    // Handle navigation
    const handleViewDetails = () => {
        if (sticker) {
            router.push(`/stickers/${sticker.id}`);
        }
    };

    const handleViewClient = () => {
        if (sticker?.client) {
            router.push(`/clients/${sticker.client.id}`);
        }
    };

    const handleViewVehicle = () => {
        if (sticker?.vehicle) {
            router.push(`/vehicles/${sticker.vehicle.id}`);
        }
    };

    // Copy sticker ID to clipboard
    const copyStickerNo = async () => {
        if (sticker) {
            try {
                await navigator.clipboard.writeText(sticker.stickerNo);
                toast({
                    title: "Sticker number copied",
                    description: "The sticker number has been copied to your clipboard."
                });
            } catch {
                toast({
                    title: "Copy failed",
                    description: "Your browser blocked access to the clipboard.",
                    variant: "destructive",
                });
            }
        }
    };

    const handleCopySerial = async () => {
        try {
            await navigator.clipboard.writeText(sticker?.stock.serialNumber || "");
            toast({
                title: "Copied",
                description: "Serial number copied to clipboard",
            });
        } catch {
            toast({
                title: "Copy failed",
                description: "Could not access clipboard",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/sticker-issuance/${sticker?.id}`, {
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

    if (!sticker) {
        return (
            <Card className="h-full flex items-center justify-center">
                <div className="text-center p-6 opacity-70">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs">Select a sticker to view details</p>
                </div>
            </Card>
        );
    }

    return (
        <>
            <Card className="h-full shadow-sm">
                <CardHeader className="border-b pb-2.5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="w-7 h-7 rounded-full bg-blue-500/15 flex items-center justify-center mr-2">
                                <Sticker className="h-3.5 w-3.5 text-blue-500" />
                            </div>
                            <CardTitle className="text-base whitespace-nowrap">
                                {sticker.stock.serialNumber}
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
                                        className="gap-2 text-xs cursor-pointer"
                                        onClick={copyStickerNo}
                                    >
                                        <CopyIcon className="h-3.5 w-3.5" />
                                        Copy sticker number
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="gap-2 text-xs cursor-pointer"
                                        onClick={handleViewDetails}
                                    >
                                        <ExternalLinkIcon className="h-3.5 w-3.5" />
                                        View details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="gap-2 text-xs cursor-pointer"
                                        onClick={handleViewClient}
                                    >
                                        <User className="h-3.5 w-3.5" />
                                        View client
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="gap-2 text-xs cursor-pointer"
                                        onClick={handleViewVehicle}
                                    >
                                        <Car className="h-3.5 w-3.5" />
                                        View vehicle
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="gap-2 text-xs text-destructive cursor-pointer"
                                        onClick={() => setShowDeleteDialog(true)}
                                        onSelect={(e) => e.preventDefault()}
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
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-3">
                    <div className="space-y-4">
                        {/* Vehicle and Policy Details */}
                        <div className="pb-2.5 border-b">
                            <div className="flex items-center mb-1.5">
                                <Car className="h-3.5 w-3.5 text-blue-500 mr-1.5 flex-shrink-0" />
                                <h3 className="font-medium text-sm">
                                    {sticker.vehicle.registrationNo}
                                </h3>
                            </div>
                            <div className="space-y-1 pl-5">
                                {sticker.policy && (
                                    <>
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <FileText className="h-3 w-3 mr-1 text-purple-500 flex-shrink-0" />
                                            {sticker.policy.policyNo}
                                        </div>
                                        {sticker.policy.client && (
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <User className="h-3 w-3 mr-1 text-indigo-500 flex-shrink-0" />
                                                {sticker.policy.client.name}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Sticker Details */}
                        <div className="pb-2.5 border-b">
                            <div className="flex items-center mb-1.5">
                                <Sticker className="h-3.5 w-3.5 text-emerald-500 mr-1.5 flex-shrink-0" />
                                <h3 className="font-medium text-sm">
                                    {sticker.stock.stickerType.name}
                                </h3>
                            </div>
                            <div className="space-y-1 pl-5">
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Building2 className="h-3 w-3 mr-1 text-orange-500 flex-shrink-0" />
                                    {sticker.stock.insurer.name}
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3 mr-1 text-blue-500 flex-shrink-0" />
                                    Issued on {format(new Date(sticker.issuedAt), "dd MMM yyyy")}
                                </div>
                            </div>
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