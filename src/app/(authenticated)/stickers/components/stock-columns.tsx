"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface StickerStock {
    id: string;
    stickerNo: string;
    receivedAt: string;
    insurerId: string;
    isIssued: boolean;
    insurer: {
        id: string;
        name: string;
        code: string;
    };
    sticker?: {
        id: string;
        stickerNo: string;
        status: string;
    };
}

export const stockColumns: ColumnDef<StickerStock>[] = [
    {
        accessorKey: "stickerNo",
        header: "Sticker No",
    },
    {
        accessorKey: "insurer.name",
        header: "Insurer",
    },
    {
        accessorKey: "receivedAt",
        header: "Received Date",
        cell: ({ row }) => {
            return format(new Date(row.original.receivedAt), "dd MMM yyyy");
        },
    },
    {
        accessorKey: "isIssued",
        header: "Status",
        cell: ({ row }) => {
            const isIssued = row.original.isIssued;
            return (
                <Badge variant={isIssued ? "default" : "secondary"}>
                    {isIssued ? "Issued" : "Available"}
                </Badge>
            );
        },
    },
]; 