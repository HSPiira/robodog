"use client";

import { Card } from "@/components/ui/card";
import { Mail, Phone, Calendar, Briefcase, CircleDot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerDetailProps {
    customer?: {
        id: string;
        name: string;
        email: string;
        phone: string;
        type: "INDIVIDUAL" | "BUSINESS" | "GOVERNMENT" | "NON_PROFIT";
        status: "active" | "inactive";
        policies: number;
        joinedDate: string;
    };
}

export function CustomerDetail({ customer }: CustomerDetailProps) {
    const formatCustomerType = (type: string) => {
        return type.replace("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    };

    return (
        <Card className="h-full p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-medium">Customer Details</h3>
            </div>

            <div className="space-y-4">
                <div>
                    {customer ? (
                        <>
                            <h4 className="text-sm font-medium mb-2">{customer.name}</h4>
                            <div className="space-y-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5" />
                                    {customer.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5" />
                                    {customer.phone}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Skeleton className="h-4 w-[140px] mb-2" />
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-3.5 w-3.5" />
                                    <Skeleton className="h-3.5 w-[160px]" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-3.5 w-3.5" />
                                    <Skeleton className="h-3.5 w-[120px]" />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="space-y-2">
                    {customer ? (
                        <>
                            <div className="flex items-center gap-2 text-xs">
                                <CircleDot className="h-3.5 w-3.5" />
                                <span>Status: </span>
                                <span className={`${customer.status === "active"
                                    ? "text-green-500"
                                    : "text-yellow-500"
                                    }`}>
                                    {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <Briefcase className="h-3.5 w-3.5" />
                                <span>Type: {formatCustomerType(customer.type)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <Briefcase className="h-3.5 w-3.5" />
                                <span>Active Policies: {customer.policies}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Joined: {new Date(customer.joinedDate).toLocaleDateString()}</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3.5 w-3.5" />
                                <Skeleton className="h-3.5 w-[100px]" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3.5 w-3.5" />
                                <Skeleton className="h-3.5 w-[140px]" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3.5 w-3.5" />
                                <Skeleton className="h-3.5 w-[120px]" />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
} 