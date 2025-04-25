"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

enum StickerStatus {
    AVAILABLE = "AVAILABLE",
    ISSUED = "ISSUED",
    VOIDED = "VOIDED",
    EXPIRED = "EXPIRED"
}

// Define base types to match Prisma schema
type Insurer = {
    id: string;
    name: string;
    email: string | null;
    address: string | null;
    phone: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    deletedAt: Date | null;
};

type StickerStock = {
    id: string;
    serialNumber: string;
    stickerTypeId: string;
    stickerStatus: string;
    receivedAt: Date;
    insurerId: string;
    isIssued: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    deletedAt: Date | null;
};

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

export type StickerStockWithRelations = StickerStock & {
    insurer: Insurer;
    sticker?: StickerIssuance;
    stickerType: {
        id: string;
        name: string;
    };
    stickerStatus: StickerStatus;
    serialNumber: string;
    receivedAt: Date;
    isIssued: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

// Define the StickerType interface to match the Prisma model
interface StickerType {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    createdBy: string;
    updatedBy: string;
    deletedAt: Date | null;
}

// Define the complete type for our table data
type StickerStockRow = {
    id: string;
    serialNumber: string;
    stickerTypeId: string;
    stickerStatus: StickerStatus;
    receivedAt: Date;
    insurerId: string;
    isIssued: boolean;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    insurer: Insurer;
    sticker?: StickerIssuance | null;
    stickerType: StickerType;
};

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