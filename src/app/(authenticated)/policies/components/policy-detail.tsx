"use client";

import { Policy } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, User, Building, X, DollarSign, FileSignature, Car } from "lucide-react";
import { PolicyStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

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
}

export function PolicyDetail({ policy, onClose }: PolicyDetailProps) {
    if (!policy) return null;

    const status = statusVariants[policy.status];

    return (
        <Card className="w-full max-w-2xl border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b bg-muted/50">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base font-semibold">Policy Details</CardTitle>
                </div>
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
            </CardHeader>
            <CardContent className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <FileText className="h-3.5 w-3.5 text-blue-500" />
                            <span>Policy Number</span>
                        </div>
                        <div className="text-sm font-medium">{policy.policyNo || "—"}</div>
                    </div>

                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <FileSignature className="h-3.5 w-3.5 text-green-500" />
                            <span>Status</span>
                        </div>
                        <Badge variant={status.variant} className={cn("capitalize text-xs", status.color, status.bg)}>
                            {policy.status.toLowerCase()}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 text-purple-500" />
                            <span>Valid From</span>
                        </div>
                        <div className="text-sm font-medium">
                            {policy.validFrom ? format(new Date(policy.validFrom), "MMM d, yyyy") : "—"}
                        </div>
                    </div>

                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 text-purple-500" />
                            <span>Valid To</span>
                        </div>
                        <div className="text-sm font-medium">
                            {policy.validTo ? format(new Date(policy.validTo), "MMM d, yyyy") : "—"}
                        </div>
                    </div>
                </div>

                <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3.5 w-3.5 text-orange-500" />
                        <span>Client</span>
                    </div>
                    <div className="text-sm font-medium">{policy.client?.name || "—"}</div>
                </div>

                <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Building className="h-3.5 w-3.5" />
                        <span>Insurer</span>
                    </div>
                    <div className="text-sm font-medium">{policy.insurer?.name || "—"}</div>
                </div>

                {policy.vehicle && (
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Car className="h-3.5 w-3.5 text-blue-500" />
                            <span>Vehicle</span>
                        </div>
                        <div className="text-sm font-medium">
                            {policy.vehicle.registrationNo}
                            {policy.vehicle.make && policy.vehicle.model && (
                                <span className="text-xs text-muted-foreground ml-2">
                                    ({policy.vehicle.make} {policy.vehicle.model})
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <DollarSign className="h-3.5 w-3.5" />
                            <span>Premium</span>
                        </div>
                        <div className="text-sm font-medium">
                            {policy.premium != null ? `$${(policy.premium || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                        </div>
                    </div>

                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <DollarSign className="h-3.5 w-3.5" />
                            <span>Stamp Duty</span>
                        </div>
                        <div className="text-sm font-medium">
                            {policy.stampDuty != null ? `$${(policy.stampDuty || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                        </div>
                    </div>
                </div>

                {policy.remarks && (
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <FileText className="h-3.5 w-3.5" />
                            <span>Remarks</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{policy.remarks}</div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 