"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Calendar, Tag, FileText, CheckCircle, AlertCircle, Check, X, ArchiveX } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { EditVehicleForm } from "./edit-vehicle-form";

// Define meta types for the table
type TableMeta = {
    fetchVehicles?: () => void;
    deactivateVehicle?: (vehicleId: string) => void;
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
    client: {
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
                <div className="font-medium uppercase whitespace-nowrap">
                    {row.getValue("registrationNo")}
                </div>
            );
        },
    },
    {
        accessorKey: "make",
        header: "Make/Model",
        cell: ({ row }: { row: Row<Vehicle> }) => {
            return (
                <div className="truncate whitespace-nowrap max-w-[150px]">
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
            return <div className="whitespace-nowrap">{row.getValue("year")}</div>;
        },
    },
    {
        accessorKey: "vehicleCategory.name",
        header: "Category",
        cell: ({ row }: { row: Row<Vehicle> }) => {
            return (
                <div className="truncate capitalize whitespace-nowrap max-w-[120px]">
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
                <div className="truncate capitalize whitespace-nowrap max-w-[120px]">
                    {row.original.bodyType?.name?.toLowerCase() || "—"}
                </div>
            );
        },
    },
    {
        accessorKey: "client.name",
        header: "Owner",
        cell: ({ row }: { row: Row<Vehicle> }) => {
            return (
                <div className="truncate whitespace-nowrap max-w-[140px]">
                    {row.original.client?.name || "—"}
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
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const vehicle = row.original;
            const meta = table.options.meta as TableMeta;

            return (
                <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <EditVehicleForm
                                vehicleId={vehicle.id}
                                trigger={
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        Edit vehicle
                                    </DropdownMenuItem>
                                }
                                onVehicleUpdated={() => meta?.fetchVehicles?.()}
                            />
                            <DropdownMenuItem className="text-destructive" onClick={() => meta?.deactivateVehicle?.(vehicle.id)}>
                                <ArchiveX className="h-4 w-4 mr-2" />
                                Deactivate
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            );
        },
    },
]; 