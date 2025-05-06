"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Car, FileText, Building2, Calendar, CheckCircle2, XCircle } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Prisma } from "@prisma/client";

export type StickerWithRelations = {
    id: string;
    serialNumber: string;
    createdAt: Date;
    issuedAt: Date;
    validFrom: Date;
    validTo: Date;
    isActive: boolean;
    vehicle: {
        registrationNo: string;
        client?: {
            name: string;
        };
    };
    policy?: {
        policyNo: string;
        client?: {
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
};

export const columns: ColumnDef<StickerWithRelations, any>[] = [
    {
        accessorKey: "serialNumber",
        header: "Serial No.",
        cell: ({ row }) => {
            return (
                <div className="font-medium">{row.getValue("serialNumber")}</div>
            );
        },
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.isActive;
            return (
                <div className="flex items-center justify-center h-full">
                    {isActive ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                    )}
                </div>
            );
        },
    },
    {
        id: "stickerType",
        header: "Type",
        cell: ({ row }) => {
            const stickerType = row.original.stock.stickerType;
            return (
                <div className="text-muted-foreground">
                    {stickerType?.name || "N/A"}
                </div>
            );
        },
    },
    {
        id: "vehicle",
        header: "Vehicle",
        cell: ({ row }) => {
            const vehicle = row.original.vehicle;
            return (
                <div className="flex items-center text-muted-foreground">
                    <Car className="h-3.5 w-3.5 mr-1 text-blue-500 flex-shrink-0" />
                    {vehicle?.registrationNo || "N/A"}
                </div>
            );
        },
    },
    {
        id: "client",
        header: "Client",
        cell: ({ row }) => {
            const client = row.original.vehicle.client?.name || row.original.policy?.client?.name;
            return (
                <div className="flex items-center text-muted-foreground">
                    {client || "N/A"}
                </div>
            );
        },
    },
    {
        id: "insurer",
        header: "Insurer",
        cell: ({ row }) => {
            const insurer = row.original.stock.insurer;
            return (
                <div className="flex items-center text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 mr-1 text-emerald-500 flex-shrink-0" />
                    {insurer?.name || "N/A"}
                </div>
            );
        },
    },
    {
        id: "issuedAt",
        header: "Issued",
        cell: ({ row }) => {
            return (
                <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 mr-1 text-orange-500 flex-shrink-0" />
                    {format(new Date(row.original.issuedAt), "dd MMM yyyy")}
                </div>
            );
        },
    },
]; 