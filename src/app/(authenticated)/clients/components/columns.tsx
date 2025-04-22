"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Mail, Phone, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditClientForm } from "./edit-client-form";
import { DeleteClientDialog } from "./delete-client-dialog";

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
                <div className="font-medium max-w-[200px] truncate">{row.getValue("name")}</div>
            );
        },
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }: { row: Row<Client> }) => {
            return (
                <div className="text-muted-foreground max-w-[200px] truncate">
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
                <div className="text-muted-foreground max-w-[150px] truncate">
                    <span>{row.original.phone || "—"}</span>
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
                <div className="text-muted-foreground max-w-[100px] truncate capitalize">
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
                <div className="flex justify-center items-center w-[50px]">
                    {status === "active" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "policies",
        header: () => <div className="text-center">Policies</div>,
        cell: ({ row }) => {
            return (
                <div className="text-center font-medium w-[50px]">
                    {row.getValue("policies")}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const client = row.original;

            // Access table refresh callback from meta
            const meta = table.options.meta as TableMeta | undefined;
            const fetchClients = meta?.fetchClients;
            const navigate = meta?.navigateToClientDetails;

            return (
                <div className="text-right w-[40px]">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-xs"
                                onClick={() => navigator.clipboard.writeText(client.id)}
                            >
                                Copy client ID
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-xs"
                                onClick={() => {
                                    if (navigate) {
                                        navigate(client.id);
                                    }
                                }}
                            >
                                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                                View details
                            </DropdownMenuItem>
                            <EditClientForm
                                clientId={client.id}
                                trigger={
                                    <DropdownMenuItem className="text-xs" onSelect={(e) => e.preventDefault()}>
                                        Edit
                                    </DropdownMenuItem>
                                }
                                onClientUpdated={() => {
                                    // Refresh the table data
                                    if (fetchClients) {
                                        fetchClients();
                                    }
                                }}
                            />
                            <DeleteClientDialog
                                clientId={client.id}
                                clientName={client.name}
                                onClientDeleted={() => {
                                    // Refresh the table data
                                    if (fetchClients) {
                                        fetchClients();
                                    }
                                }}
                            />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
]; 