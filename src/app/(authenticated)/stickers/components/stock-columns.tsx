"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { StickerStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";

// Define the expanded relation type from Prisma
export type StickerStockWithRelations = Prisma.StickerStockGetPayload<{
    include: {
        insurer: true;
        sticker: true;
        stickerType: true;
    };
}>;

// Define the complete type for our table data
type StickerStockRow = StickerStockWithRelations;

export const stockColumns: ColumnDef<StickerStockWithRelations, any>[] = [
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
        accessorKey: "stickerType",
        header: "Type",
        cell: ({ row }) => {
            const stickerType = row.original.stickerType;
            return (
                <div className="text-muted-foreground">
                    {stickerType?.name || "N/A"}
                </div>
            );
        },
    },
    {
        accessorKey: "receivedAt",
        header: "Received",
        cell: ({ row }) => {
            return (
                <div className="text-muted-foreground">
                    {format(row.original.receivedAt, "dd MMM yyyy")}
                </div>
            );
        },
    },
    {
        accessorKey: "stickerStatus",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.stickerStatus;
            return (
                <Badge variant={status === "AVAILABLE" ? "secondary" : "default"}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                </Badge>
            );
        },
    },
    {
        accessorKey: "insurer",
        header: "Insurer",
        cell: ({ row }) => {
            const insurer = row.original.insurer;
            return (
                <div className="text-muted-foreground">
                    {insurer?.name || "N/A"}
                </div>
            );
        },
    },
]; 