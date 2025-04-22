"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { CheckCircle, AlertCircle, Home } from "lucide-react";

// Define meta types for the table
type TableMeta = {
    fetchClients?: () => void;
    navigateToClientDetails?: (clientId: string) => void;
};

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    type: "INDIVIDUAL" | "BUSINESS" | "GOVERNMENT" | "NON_PROFIT";
    status: "active" | "inactive";
    policies: number;
    joinedDate: string;
    createdBy?: string | null;
    updatedBy?: string | null;
}

// Export the columns
export const columns: ColumnDef<Client>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            return (
                <div className="font-medium max-w-[160px] truncate">{row.getValue("name")}</div>
            );
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }: { row: Row<Client> }) => {
            return (
                <div className="text-muted-foreground max-w-[160px] truncate">
                    <span>{row.original.email || "—"}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }: { row: Row<Client> }) => {
            return (
                <div className="text-muted-foreground max-w-[120px] truncate">
                    <span>{row.original.phone || "—"}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }: { row: Row<Client> }) => {
            return (
                <div className="text-muted-foreground max-w-[180px] truncate">
                    <span>{row.original.address || "—"}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }: { row: Row<Client> }) => {
            const type = row.getValue("type") as string;
            const formattedType = type.replace("_", " ");
            return (
                <div className="text-muted-foreground max-w-[90px] truncate capitalize">
                    {formattedType.toLowerCase()}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }: { row: Row<Client> }) => {
            const status = row.getValue("status") as string;
            return (
                <div className="flex justify-center items-center w-[40px]">
                    {status === "active" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                </div>
            );
        },
    },
]; 