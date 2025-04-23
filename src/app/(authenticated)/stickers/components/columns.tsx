"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

interface Sticker {
    id: string;
    stickerNo: string;
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
    isActive: boolean;
}

export const columns: ColumnDef<Sticker>[] = [
    {
        accessorKey: "stickerNo",
        header: "Sticker No.",
        cell: ({ row }) => {
            return (
                <div className="font-medium">{row.getValue("stickerNo")}</div>
            );
        },
    },
    {
        accessorFn: row => row.policy?.policyNo,
        id: "policyNo",
        header: "Policy No.",
        cell: ({ row }) => {
            return (
                <div className="text-muted-foreground">
                    {row.original.policy?.policyNo || "—"}
                </div>
            );
        },
    },
    {
        accessorFn: row => row.policy?.vehicle?.registrationNo,
        id: "vehicleRegistrationNo",
        header: "Vehicle",
        cell: ({ row }) => {
            return (
                <div className="text-muted-foreground">
                    {row.original.policy?.vehicle?.registrationNo || "—"}
                </div>
            );
        },
    },
    {
        accessorFn: row => row.policy?.client?.name,
        id: "clientName",
        header: "Client",
        cell: ({ row }) => {
            return (
                <div className="text-muted-foreground">
                    {row.original.policy?.client?.name || "—"}
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
                    {format(new Date(row.original.createdAt), "dd MMM yyyy")}
                </div>
            );
        },
    },
]; 