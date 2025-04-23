"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";

interface Insurer {
    id: string;
    name: string;
    code: string;
    email: string;
    phone: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const columns: ColumnDef<Insurer>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "code",
        header: "Code",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "phone",
        header: "Phone",
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.isActive;
            return (
                <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
            return format(new Date(row.original.createdAt), "MMM d, yyyy");
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const insurer = row.original;

            const handleDelete = async () => {
                try {
                    const response = await fetch(`/api/insurers/${insurer.id}`, {
                        method: "DELETE",
                    });

                    if (!response.ok) {
                        throw new Error("Failed to delete insurer");
                    }

                    toast({
                        title: "Insurer deleted",
                        description: "The insurer has been deleted successfully.",
                    });

                    // Trigger table refresh
                    row.table.options.meta?.onRefresh?.();
                } catch (error) {
                    console.error("Error deleting insurer:", error);
                    toast({
                        title: "Error",
                        description: "Failed to delete insurer. Please try again.",
                        variant: "destructive",
                    });
                }
            };

            const handleToggleStatus = async () => {
                try {
                    const response = await fetch(`/api/insurers/${insurer.id}`, {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            isActive: !insurer.isActive,
                        }),
                    });

                    if (!response.ok) {
                        throw new Error("Failed to update insurer status");
                    }

                    toast({
                        title: "Status updated",
                        description: `Insurer is now ${!insurer.isActive ? "active" : "inactive"}.`,
                    });

                    // Trigger table refresh
                    row.table.options.meta?.onRefresh?.();
                } catch (error) {
                    console.error("Error updating insurer status:", error);
                    toast({
                        title: "Error",
                        description: "Failed to update insurer status. Please try again.",
                        variant: "destructive",
                    });
                }
            };

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-xs cursor-pointer"
                            onClick={handleToggleStatus}
                        >
                            {insurer.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-xs text-destructive cursor-pointer"
                            onClick={handleDelete}
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
]; 