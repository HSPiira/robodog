"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { StickerStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { CheckCircle, CircleSlash } from "lucide-react";

// Define the expanded relation type from Prisma
export type StickerStockWithRelations = Prisma.StickerStockGetPayload<{
    include: {
        insurer: true;
        sticker: {
            include: {
                policy: {
                    include: {
                        client: {
                            select: {
                                name: true;
                            };
                        };
                    };
                };
                vehicle: {
                    select: {
                        registrationNo: true;
                    };
                };
            };
        };
        stickerType: true;
    };
}>;

// Define the complete type for our table data
type StickerStockRow = StickerStockWithRelations;

export const stockColumns: ColumnDef<StickerStockWithRelations>[] = [
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
        id: "stickerType",
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
        id: "receivedAt",
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
        id: "stickerStatus",
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => {
            const status = row.original.stickerStatus;
            return (
                <div className="text-center">
                    {status === "AVAILABLE" ? (
                        <div className="inline-flex items-center text-xs text-green-600">
                            <CheckCircle className="h-3.5 w-3.5 mr-1 stroke-2" />
                            Available
                        </div>
                    ) : (
                        <div className="inline-flex items-center text-xs text-amber-600">
                            <CircleSlash className="h-3.5 w-3.5 mr-1 stroke-2" />
                            Used
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        id: "insurer",
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