"use client";

import { ColumnDef, Row } from "@tanstack/react-table";
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
} from "lucide-react";
import { Policy, PolicyStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const statusVariants: Record<PolicyStatus, "default" | "secondary" | "destructive" | "outline"> = {
    ACTIVE: "default",
    EXPIRED: "destructive",
    CANCELLED: "destructive",
    PENDING: "outline",
    INACTIVE: "secondary",
};

const statusIcons: Record<PolicyStatus, React.ReactNode> = {
    ACTIVE: <CheckCircle className="h-4 w-4 text-green-500" />,
    EXPIRED: <XCircle className="h-4 w-4 text-red-500" />,
    CANCELLED: <XCircle className="h-4 w-4 text-red-500" />,
    PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
    INACTIVE: <AlertCircle className="h-4 w-4 text-gray-500" />,
};

interface ColumnsProps {
    onPolicyUpdate?: () => void;
}

export const createColumns = ({ onPolicyUpdate }: ColumnsProps = {}) => {
    return [
        {
            accessorKey: "policyNo",
            header: () => <div className="whitespace-nowrap">Policy No</div>,
            cell: ({ row }) => {
                return (
                    <div className="font-medium uppercase whitespace-nowrap py-1">
                        {row.getValue("policyNo")}
                    </div>
                );
            },
        },
        {
            accessorKey: "client.name",
            header: () => <div className="whitespace-nowrap">Client</div>,
            cell: ({ row }: { row: Row<Policy & { client: { id: string; name: string }; insurer: { id: string; name: string } }> }) => {
                return (
                    <div className="truncate whitespace-nowrap max-w-[150px] py-1">
                        {row.original.client?.name || "—"}
                    </div>
                );
            },
        },
        {
            accessorKey: "insurer.name",
            header: () => <div className="whitespace-nowrap">Insurer</div>,
            cell: ({ row }: { row: Row<Policy & { client: { id: string; name: string }; insurer: { id: string; name: string } }> }) => {
                return (
                    <div className="truncate whitespace-nowrap max-w-[120px] py-1">
                        {row.original.insurer?.name || "—"}
                    </div>
                );
            },
        },
        {
            accessorKey: "status",
            header: () => <div className="whitespace-nowrap">Status</div>,
            cell: ({ row }) => {
                const status = row.getValue("status") as PolicyStatus;
                return (
                    <div className="flex items-center justify-center py-1" title={status.toLowerCase()}>
                        {statusIcons[status]}
                    </div>
                );
            },
        },
        {
            accessorKey: "validFrom",
            header: () => <div className="whitespace-nowrap">Valid From</div>,
            cell: ({ row }) => {
                const rawDate = row.getValue("validFrom");
                const date = typeof rawDate === 'string' || rawDate instanceof Date ? new Date(rawDate) : null;
                return (
                    <div className="whitespace-nowrap py-1">
                        {date && !isNaN(date.getTime())
                            ? date.toLocaleDateString()
                            : "—"}
                    </div>
                );
            },
        },
        {
            accessorKey: "validTo",
            header: () => <div className="whitespace-nowrap">Valid To</div>,
            cell: ({ row }) => {
                const rawDate = row.getValue("validTo");
                const date = typeof rawDate === 'string' || rawDate instanceof Date ? new Date(rawDate) : null;
                return (
                    <div className="whitespace-nowrap py-1">
                        {date && !isNaN(date.getTime())
                            ? date.toLocaleDateString()
                            : "—"}
                    </div>
                );
            },
        },
    ] as ColumnDef<Policy & { client: { id: string; name: string }; insurer: { id: string; name: string } }>[];
}; 