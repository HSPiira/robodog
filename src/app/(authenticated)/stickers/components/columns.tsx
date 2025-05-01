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
import type { Prisma } from "@prisma/client";

type PolicyWithRelations = {
    policyNo: string | null;
    vehicle: {
        registrationNo: string | null;
    } | null;
    client: {
        name: string | null;
    } | null;
};

export type StickerWithRelations = {
    id: string;
    serialNumber: string;
    createdAt: Date;
    policy: PolicyWithRelations | null;
};

export const columns: ColumnDef<StickerWithRelations>[] = [
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
        id: "policyNo",
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
        id: "vehicle",
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
        id: "client",
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