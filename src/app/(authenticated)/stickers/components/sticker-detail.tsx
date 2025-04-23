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
    };
    onRefresh?: () => void;
}

export function StickerDetail({ sticker, onRefresh }: StickerDetailProps) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
        <Card className="h-full shadow-sm">
            <CardHeader className="border-b pb-2.5">
                <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                        <CardTitle className="text-sm font-medium">Sticker {sticker.stickerNo}</CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={cn(
                                "text-[10px] px-1 py-0 h-4 rounded-sm",
                                getStatusColor(sticker.status)
                            )}>
                                {sticker.status}
                            </Badge>
                            <Badge variant="secondary" className={cn(
                                "text-[10px] px-1 py-0 h-4 rounded-sm",
                                getBureauColor(sticker.bureau)
                            )}>
                                {sticker.bureau}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={handleViewDetails}
                            title="View Details"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                        </Button>

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
                                    <Copy className="h-3.5 w-3.5" />
                                    Copy sticker number
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
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <div className="space-y-3">
                    <div className="space-y-1">
                        <h4 className="text-[10px] font-medium text-muted-foreground">Policy Details</h4>
                        <p className="text-xs">{sticker.policyNo}</p>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-[10px] font-medium text-muted-foreground">Vehicle Details</h4>
                        <div className="flex items-center gap-2">
                            <p className="text-xs">{sticker.vehicle.registrationNo}</p>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <p className="text-xs text-muted-foreground">{sticker.vehicle.type}</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-[10px] font-medium text-muted-foreground">Client Details</h4>
                        <p className="text-xs">{sticker.client.name}</p>
                    </div>
                </div>
                <div className="pt-2 border-t space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Created {format(new Date(sticker.createdAt), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Last updated {format(new Date(sticker.updatedAt), "MMM d, yyyy")}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 