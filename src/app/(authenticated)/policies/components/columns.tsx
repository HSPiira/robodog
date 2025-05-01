"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Calendar,
    User,
    Car,
    Building,
    CheckCircle,
    AlertCircle,
    XCircle,
    Clock,
    MoreHorizontal,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PolicyStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

export interface Policy {
    id: string;
    policyNo: string;
    status: PolicyStatus;
    validFrom: Date;
    validTo: Date;
    premium: number;
    stampDuty: number;
    remarks?: string;
    client: {
        id: string;
        name: string;
    };
    vehicle: {
        id: string;
        registrationNo: string;
        make: string;
        model: string;
    };
    insurer: {
        id: string;
        name: string;
    };
    isActive: boolean;
}

const statusVariants: Record<PolicyStatus, "default" | "secondary" | "destructive" | "outline"> = {
    ACTIVE: "default",
    EXPIRED: "destructive",
    CANCELLED: "destructive",
    PENDING: "outline",
    INACTIVE: "secondary",
};

export const columns: ColumnDef<Policy>[] = [
    {
        accessorKey: "policyNo",
        header: "Policy No",
        cell: ({ row }) => {
            return (
                <div className="font-medium uppercase whitespace-nowrap">
                    {row.getValue("policyNo")}
                </div>
            );
        },
    },
    {
        accessorKey: "client.name",
        header: "Client",
        cell: ({ row }: { row: Row<Policy> }) => {
            return (
                <div className="truncate whitespace-nowrap max-w-[150px]">
                    {row.original.client?.name || "—"}
                </div>
            );
        },
    },
    {
        accessorKey: "vehicle.registrationNo",
        header: "Vehicle",
        cell: ({ row }: { row: Row<Policy> }) => {
            const vehicle = row.original.vehicle;
            return vehicle ? (
                <div className="truncate whitespace-nowrap max-w-[150px]">
                    <span className="font-medium">{vehicle.registrationNo}</span>
                    <span className="text-muted-foreground"> {vehicle.make} {vehicle.model}</span>
                </div>
            ) : <span className="text-muted-foreground">—</span>;
        },
    },
    {
        accessorKey: "insurer.name",
        header: "Insurer",
        cell: ({ row }: { row: Row<Policy> }) => {
            return (
                <div className="truncate whitespace-nowrap max-w-[120px]">
                    {row.original.insurer?.name || "—"}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as PolicyStatus;
            return (
                <Badge variant={statusVariants[status]} className="capitalize">
                    {status.toLowerCase()}
                </Badge>
            );
        },
    },
    {
        accessorKey: "validFrom",
        header: "Valid From",
        cell: ({ row }) => {
            const date = new Date(row.getValue("validFrom"));
            return (
                <div className="whitespace-nowrap">
                    {date.toLocaleDateString()}
                </div>
            );
        },
    },
    {
        accessorKey: "validTo",
        header: "Valid To",
        cell: ({ row }) => {
            const date = new Date(row.getValue("validTo"));
            return (
                <div className="whitespace-nowrap">
                    {date.toLocaleDateString()}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const policy = row.original;

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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Policy</DropdownMenuItem>
                        <DropdownMenuItem>Renew Policy</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Cancel Policy</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
]; 