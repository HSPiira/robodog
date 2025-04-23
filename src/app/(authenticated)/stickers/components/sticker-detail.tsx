"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Printer, Edit, Trash2, Ticket, FileText, Car, User, Calendar, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type StickerStatus = "AVAILABLE" | "ISSUED" | "VOIDED" | "EXPIRED";

interface StickerDetailProps {
    sticker: {
        id: string;
        stickerNo: string;
        status: StickerStatus;
        policy?: {
            id: string;
            policyNo: string;
            vehicle?: {
                id: string;
                registrationNo: string;
                make?: string;
                model?: string;
            };
            client?: {
                id: string;
                name: string;
                email?: string;
                phone?: string;
            };
        };
        createdAt: string;
        updatedAt: string;
    };
    onRefresh: () => void;
}

const statusConfig = {
    AVAILABLE: { icon: CheckCircle, color: "text-green-600", text: "Available" },
    ISSUED: { icon: Clock, color: "text-blue-600", text: "Issued" },
    VOIDED: { icon: XCircle, color: "text-red-600", text: "Voided" },
    EXPIRED: { icon: AlertCircle, color: "text-amber-600", text: "Expired" }
};

export function StickerDetail({ sticker, onRefresh }: StickerDetailProps) {
    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/stickers/${sticker.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete sticker");
            }

            toast.success("Sticker deleted successfully");
            onRefresh();
        } catch (error) {
            console.error("Error deleting sticker:", error);
            toast.error("Failed to delete sticker");
        }
    };

    if (!sticker) {
        return (
            <Card className="h-full flex items-center justify-center">
                <div className="text-center p-6 opacity-70">
                    <Ticket className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs">Select a sticker to view details</p>
                </div>
            </Card>
        );
    }

    const status = statusConfig[sticker.status];
    const StatusIcon = status.icon;

    return (
        <Card className="h-full shadow-sm">
            <CardHeader className="border-b pb-2.5">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center mr-2">
                            <Ticket className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <CardTitle className="text-base whitespace-nowrap">{sticker.stickerNo}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center text-xs ${status.color}`}>
                            <StatusIcon className="h-3.5 w-3.5 mr-1 stroke-2" />
                            {status.text}
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toast.info("Print functionality coming soon")}
                            title="Print Sticker"
                        >
                            <Printer className="h-3.5 w-3.5" />
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
                                    onClick={() => toast.info("Edit functionality coming soon")}
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                    Edit sticker
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="gap-2 text-xs text-destructive cursor-pointer"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete sticker
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-3">
                <div className="space-y-4">
                    {/* Policy details */}
                    {sticker.policy && (
                        <div className="pb-2.5 border-b">
                            <div className="flex items-center mb-1.5">
                                <FileText className="h-3.5 w-3.5 text-blue-500 mr-1.5 flex-shrink-0" />
                                <h3 className="font-medium text-sm truncate">
                                    {sticker.policy.policyNo}
                                </h3>
                            </div>
                            {sticker.policy.vehicle && (
                                <div className="flex items-center text-xs text-muted-foreground pl-5">
                                    <Car className="h-3 w-3 inline mr-1 text-orange-500 flex-shrink-0" />
                                    <span className="truncate">
                                        {sticker.policy.vehicle.registrationNo}
                                        {sticker.policy.vehicle.make && sticker.policy.vehicle.model && (
                                            <span className="ml-1">• {sticker.policy.vehicle.make} {sticker.policy.vehicle.model}</span>
                                        )}
                                    </span>
                                </div>
                            )}
                            {sticker.policy.client && (
                                <div className="flex items-center text-xs mt-2 pl-5">
                                    <User className="h-3 w-3 mr-1.5 text-primary flex-shrink-0" />
                                    Client: <span className="font-medium ml-1 truncate max-w-[180px] inline-block">{sticker.policy.client.name}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Timestamps */}
                    <div>
                        <h4 className="font-medium text-xs mb-3 flex items-center">
                            <Calendar className="h-3.5 w-3.5 text-primary mr-1.5 flex-shrink-0" />
                            Timestamps
                        </h4>

                        <div className="space-y-2.5">
                            <div className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 text-green-500 mr-2 flex-shrink-0" />
                                <span className="text-xs text-muted-foreground">Created</span>
                                <span className="text-xs text-muted-foreground mx-1">:</span>
                                <span className="text-xs font-medium">
                                    {format(new Date(sticker.createdAt), "PPpp")}
                                </span>
                            </div>

                            <div className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 text-orange-500 mr-2 flex-shrink-0" />
                                <span className="text-xs text-muted-foreground">Updated</span>
                                <span className="text-xs text-muted-foreground mx-1">:</span>
                                <span className="text-xs font-medium">
                                    {format(new Date(sticker.updatedAt), "PPpp")}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 