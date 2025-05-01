"use client";

import { Policy } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, User, Building, X, DollarSign, FileSignature, Car, MoreHorizontal } from "lucide-react";
import { PolicyStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const statusVariants: Record<PolicyStatus, { variant: "default" | "secondary" | "destructive" | "outline", color: string, bg: string }> = {
    ACTIVE: { variant: "default", color: "text-green-600", bg: "bg-green-50" },
    EXPIRED: { variant: "destructive", color: "text-red-600", bg: "bg-red-50" },
    CANCELLED: { variant: "destructive", color: "text-red-600", bg: "bg-red-50" },
    PENDING: { variant: "outline", color: "text-yellow-600", bg: "bg-yellow-50" },
    INACTIVE: { variant: "secondary", color: "text-gray-600", bg: "bg-gray-50" },
};

interface PolicyDetailProps {
    policy: (Policy & {
        client: { id: string; name: string };
        insurer: { id: string; name: string };
        vehicle?: {
            id: string;
            registrationNo: string;
            make?: string;
            model?: string;
        } | null;
    }) | null;
    onClose?: () => void;
    onPolicyUpdate?: () => void;
}

export function PolicyDetail({ policy, onClose, onPolicyUpdate }: PolicyDetailProps) {
    if (!policy) return null;

    const status = statusVariants[policy.status];

    const handleCancelPolicy = () => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this policy?"
        );
        if (confirmed) {
            fetch(`/api/policies/${policy.id}/cancel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            })
                .then(response => {
                    if (!response.ok) throw new Error("Failed to cancel policy");
                    return response.json();
                })
                .then(() => {
                    if (typeof onPolicyUpdate === 'function') {
                        onPolicyUpdate();
                    }
                    toast.success("Policy cancelled", {
                        description: "The policy has been successfully cancelled.",
                    });
                })
                .catch(error => {
                    console.error("Error cancelling policy:", error);
                    toast.error("Error", {
                        description: "Failed to cancel the policy. Please try again.",
                    });
                });
        }
    };

    return (
        <Card className="w-full max-w-2xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b bg-muted/50">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base font-semibold">{policy.policyNo}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={status.variant} className={cn("capitalize", status.color, status.bg)}>
                        <FileSignature className="h-3.5 w-3.5 mr-1" />
                        {policy.status.toLowerCase()}
                    </Badge>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() =>
                                    (window.location.href = `/policies/${policy.id}`)
                                }
                            >
                                View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    (window.location.href = `/policies/${policy.id}/edit`)
                                }
                            >
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    (window.location.href = `/policies/${policy.id}/renew`)
                                }
                            >
                                Renew
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={handleCancelPolicy}
                            >
                                Cancel Policy
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Close details panel"
                            onClick={onClose}
                            className="h-7 w-7"
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-24">
                            <Calendar className="h-3.5 w-3.5 text-purple-500" />
                            <span>Valid:</span>
                        </div>
                        <div className="text-xs">
                            {policy.validFrom ? format(new Date(policy.validFrom), "MMM d, yyyy") : "—"}
                            <span className="text-muted-foreground mx-1">to</span>
                            {policy.validTo ? format(new Date(policy.validTo), "MMM d, yyyy") : "—"}
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-24">
                            <User className="h-3.5 w-3.5 text-orange-500" />
                            <span>Client:</span>
                        </div>
                        <div className="text-xs">{policy.client?.name || "—"}</div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-24">
                            <Building className="h-3.5 w-3.5" />
                            <span>Insurer:</span>
                        </div>
                        <div className="text-xs">{policy.insurer?.name || "—"}</div>
                    </div>

                    {policy.vehicle && (
                        <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-24">
                                <Car className="h-3.5 w-3.5 text-blue-500" />
                                <span>Vehicle:</span>
                            </div>
                            <div className="text-xs">
                                {policy.vehicle.registrationNo}
                                {policy.vehicle.make && policy.vehicle.model && (
                                    <span className="text-xs text-muted-foreground ml-2">
                                        ({policy.vehicle.make} {policy.vehicle.model})
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-24">
                            <DollarSign className="h-3.5 w-3.5" />
                            <span>Premium:</span>
                        </div>
                        <div className="text-xs">
                            {policy.premium != null ? `$${(policy.premium || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-24">
                            <DollarSign className="h-3.5 w-3.5" />
                            <span>Stamp Duty:</span>
                        </div>
                        <div className="text-xs">
                            {policy.stampDuty != null ? `$${(policy.stampDuty || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                        </div>
                    </div>

                    {policy.remarks && (
                        <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-24">
                                <FileText className="h-3.5 w-3.5" />
                                <span>Remarks:</span>
                            </div>
                            <div className="text-xs text-muted-foreground">{policy.remarks}</div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 
