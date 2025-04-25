"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define StickerIssuance type since it's not yet available in @prisma/client
type StickerIssuance = {
    id: string;
    policyId: string | null;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    isActive: boolean;
    deletedAt: Date | null;
    issuedAt: Date | null;
    issuedBy: string | null;
    vehicleId: string | null;
    stockId: string | null;
    stickerTypeId: string | null;
};

export type StickerWithRelations = StickerIssuance & {
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
};

// Update the Sticker interface to match StickerIssuance
interface Sticker {
    id: string;
    policyId: string | null;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    isActive: boolean;
    deletedAt: Date | null;
    issuedAt: Date | null;
    issuedBy: string | null;
    vehicleId: string | null;
    stockId: string | null;
    stickerTypeId: string | null;
}

export const columns: ColumnDef<StickerWithRelations, any>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => {
            return (
                <div className="font-medium">{row.getValue("id")}</div>
            );
        },
    },
    {
        accessorKey: "policy",
        header: "Policy",
        cell: ({ row }) => {
            const policy = row.original.policy;
            return (
                <div className="text-muted-foreground">
                    {policy?.policyNo || "N/A"}
                </div>
            );
        },
    },
    {
        accessorKey: "policy",
        header: "Vehicle",
        cell: ({ row }) => {
            const policy = row.original.policy;
            return (
                <div className="text-muted-foreground">
                    {policy?.vehicle?.registrationNo || "N/A"}
                </div>
            );
        },
    },
    {
        accessorKey: "policy",
        header: "Client",
        cell: ({ row }) => {
            const policy = row.original.policy;
            return (
                <div className="text-muted-foreground">
                    {policy?.client?.name || "N/A"}
                </div>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
            return (
                <div className="text-muted-foreground">
                    {format(row.original.createdAt, "dd MMM yyyy")}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const sticker = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => {
                                // Handle delete
                                console.log("Delete", sticker.id);
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
]; 