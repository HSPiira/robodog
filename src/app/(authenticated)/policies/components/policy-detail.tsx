"use client";

import { Policy } from "./columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, User, Car, Building, X } from "lucide-react";
import { PolicyStatus } from "@prisma/client";

const statusVariants: Record<PolicyStatus, "default" | "secondary" | "destructive" | "outline"> = {
    ACTIVE: "default",
    EXPIRED: "destructive",
    CANCELLED: "destructive",
    PENDING: "outline",
    INACTIVE: "secondary",
};

interface PolicyDetailProps {
    policy: Policy | null;
    onClose?: () => void;
}

export function PolicyDetail({ policy, onClose }: PolicyDetailProps) {
    if (!policy) return null;

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Policy Details</CardTitle>
                {onClose && (
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Close details panel"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Policy No:</span>
                        <span className="font-mono">{policy.policyNo}</span>
                    </div>
                    <Badge variant={statusVariants[policy.status]} className="capitalize">
                        {policy.status.toLowerCase()}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Valid From:</span>
                        </div>
                        <div className="pl-7">
                            {format(new Date(policy.validFrom), "MMM d, yyyy")}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Valid To:</span>
                        </div>
                        <div className="pl-7">
                            {format(new Date(policy.validTo), "MMM d, yyyy")}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Client:</span>
                    </div>
                    <div className="pl-7">
                        <div className="font-medium">{policy.client.name}</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Car className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Vehicle:</span>
                    </div>
                    <div className="pl-7">
                        <div className="font-medium">{policy.vehicle.registrationNo}</div>
                        <div className="text-sm text-muted-foreground">
                            {policy.vehicle.make} {policy.vehicle.model}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Insurer:</span>
                    </div>
                    <div className="pl-7">
                        <div className="font-medium">{policy.insurer.name}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="font-medium">Premium:</div>
                        <div className="text-2xl font-bold">
                            ${policy.premium.toLocaleString()}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="font-medium">Stamp Duty:</div>
                        <div className="text-2xl font-bold">
                            ${policy.stampDuty.toLocaleString()}
                        </div>
                    </div>
                </div>

                {policy.remarks && (
                    <div className="space-y-2">
                        <div className="font-medium">Remarks:</div>
                        <div className="text-sm text-muted-foreground">{policy.remarks}</div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 