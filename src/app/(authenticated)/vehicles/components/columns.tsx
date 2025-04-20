"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Calendar, Tag, FileText, CheckCircle, AlertCircle, Check, X } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { EditVehicleForm } from "./edit-vehicle-form";

// Define meta types for the table
type TableMeta = {
    fetchVehicles?: () => void;
};

interface Vehicle {
    id: string;
    registrationNo: string;
    make: string;
    model: string;
    year: number;
    chassisNo: string;
    engineNo: string;
    bodyType: {
        name: string;
    };
    vehicleCategory: {
        name: string;
    };
    vehicleType: {
        name: string;
    };
    customer: {
        id: string;
        name: string;
    };
    isActive: boolean;
    policies: number;
}

export const columns: ColumnDef<Vehicle>[] = [
    {
        accessorKey: "registrationNo",
        header: "Reg. No.",
        cell: ({ row }) => {
            return (
                <div className="font-medium uppercase">{row.getValue("registrationNo")}</div>
            );
        },
    },
    {
        accessorKey: "make",
        header: "Make/Model",
        cell: ({ row }: { row: Row<Vehicle> }) => {
            return (
                <div className="max-w-[200px] truncate">
                    <span className="font-medium">{row.getValue("make")}</span>
                    <span className="text-muted-foreground"> {row.original.model}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "year",
        header: "Year",
        cell: ({ row }) => {
            return <div className="text-center">{row.getValue("year")}</div>;
        },
    },
    {
        accessorKey: "vehicleCategory.name",
        header: "Category",
        cell: ({ row }: { row: Row<Vehicle> }) => {
            return (
                <div className="max-w-[120px] truncate capitalize">
                    {row.original.vehicleCategory?.name?.toLowerCase() || "—"}
                </div>
            );
        },
    },
    {
        accessorKey: "bodyType.name",
        header: "Body Type",
        cell: ({ row }: { row: Row<Vehicle> }) => {
            return (
                <div className="max-w-[120px] truncate capitalize">
                    {row.original.bodyType?.name?.toLowerCase() || "—"}
                </div>
            );
        },
    },
    {
        accessorKey: "customer.name",
        header: "Owner",
        cell: ({ row }: { row: Row<Vehicle> }) => {
            return (
                <div className="max-w-[150px] truncate">
                    {row.original.customer?.name || "—"}
                </div>
            );
        },
    },
    {
        accessorKey: "isActive",
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }: { row: Row<Vehicle> }) => {
            const isActive = row.getValue("isActive") as boolean;

            return (
                <div className="flex justify-center">
                    {isActive ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                            Active
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800">
                            Inactive
                        </Badge>
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
                <div className="text-center font-medium">
                    {row.getValue("policies") || 0}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const vehicle = row.original;
            const fetchVehicles = (table.options.meta as TableMeta)?.fetchVehicles;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <EditVehicleForm
                            vehicleId={vehicle.id}
                            onVehicleUpdated={fetchVehicles || (() => { })}
                            trigger={
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    Edit vehicle
                                </DropdownMenuItem>
                            }
                        />
                        {vehicle.isActive ? (
                            <DropdownMenuItem
                                onClick={async () => {
                                    try {
                                        const response = await fetch(`/api/vehicles/${vehicle.id}/deactivate`, {
                                            method: 'PATCH'
                                        });

                                        if (!response.ok) {
                                            throw new Error("Failed to deactivate vehicle");
                                        }

                                        fetchVehicles?.();
                                    } catch (error) {
                                        console.error("Error deactivating vehicle:", error);
                                    }
                                }}
                            >
                                Deactivate
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                onClick={async () => {
                                    try {
                                        const response = await fetch(`/api/vehicles/${vehicle.id}/activate`, {
                                            method: 'PATCH'
                                        });

                                        if (!response.ok) {
                                            throw new Error("Failed to activate vehicle");
                                        }

                                        fetchVehicles?.();
                                    } catch (error) {
                                        console.error("Error activating vehicle:", error);
                                    }
                                }}
                            >
                                Activate
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
]; 