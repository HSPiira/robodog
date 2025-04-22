"use client";

import { Calendar, Phone, Mail, User, Clock, PenTool, Shield, Info, Car, ArrowRight, Plus, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CreateVehicleForm } from "../../vehicles/components/create-vehicle-form";
import { useState, useEffect } from "react";

interface CustomerDetailProps {
    customer?: {
        id: string;
        name: string;
        email: string;
        phone: string;
        type: string;
        status: "active" | "inactive";
        policies: number;
        joinedDate: string;
        createdBy?: string | null;
        updatedBy?: string | null;
    };
}

interface VehicleCount {
    count: number;
}

export function CustomerDetail({ customer }: CustomerDetailProps) {
    const router = useRouter();
    const [vehicleCount, setVehicleCount] = useState<number>(0);
    const [isLoadingVehicles, setIsLoadingVehicles] = useState<boolean>(false);

    // Get color based on customer type
    const getTypeColor = (type: string) => {
        if (!type) return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
        switch (type.toUpperCase()) {
            case "INDIVIDUAL":
                return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
            case "BUSINESS":
                return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300";
            case "GOVERNMENT":
                return "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300";
            case "NON_PROFIT":
                return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    // Get status color
    const getStatusColor = (status: string) => {
        return status === "active"
            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
    };

    // Handle view vehicles button click
    const handleViewVehicles = () => {
        if (customer) {
            router.push(`/vehicles?customerId=${customer.id}`);
        }
    };

    // Navigate to client details page
    const handleViewDetails = () => {
        if (customer) {
            router.push(`/clients/${customer.id}`);
        }
    };

    // Load vehicle count when customer changes
    useEffect(() => {
        const controller = new AbortController();

        const fetchVehicleCount = async () => {
            if (!customer) return;

            try {
                setIsLoadingVehicles(true);
                const response = await fetch(
                    `/api/clients/${customer.id}/vehicles/count`,
                    { signal: controller.signal },
                );
                if (response.ok) {
                    const data: VehicleCount = await response.json();
                    setVehicleCount(data.count);
                }
            } catch (error) {
                // Ignore abort errors, log everything else
                if ((error as any).name !== "AbortError") {
                    console.error("Error fetching vehicle count:", error);
                }
            } finally {
                setIsLoadingVehicles(false);
            }
        };

        // Reset any stale count immediately
        setVehicleCount(0);
        fetchVehicleCount();

        // Cleanup: abort any in-flight request on unmount or deps change
        return () => controller.abort();
    }, [customer]);

    const handleVehicleCreated = () => {
        // Refresh vehicle count
        if (customer) {
            setVehicleCount(prevCount => prevCount + 1);
        }
    };

    return (
        <Card className="h-full overflow-hidden border-t-4 border-t-primary shadow-md">
            <CardHeader className="pb-3 bg-muted/30">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">Customer Details</CardTitle>
                    {customer && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={handleViewDetails}
                        >
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                            View Details
                        </Button>
                    )}
                </div>
                <CardDescription className="text-xs">
                    {customer ? "View full customer information" : "Select a customer to view details"}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {customer ? (
                    <div className="space-y-4 p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/15 flex-shrink-0 shadow-sm">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-medium leading-none">{customer.name}</h3>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className={cn(
                                        "text-[10px] px-1 py-0 h-4 rounded-sm",
                                        getStatusColor(customer.status)
                                    )}>
                                        {customer.status}
                                    </Badge>
                                    <Badge variant="secondary" className={cn(
                                        "text-[10px] px-1 py-0 h-4 rounded-sm",
                                        getTypeColor(customer.type)
                                    )}>
                                        {customer.type.toLowerCase().replace("_", " ")}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 p-3 rounded-lg bg-muted/20">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Mail className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                                <span className="truncate">{customer.email || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Phone className="h-3.5 w-3.5 text-green-500 dark:text-green-400 flex-shrink-0" />
                                <span className="truncate">{customer.phone || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                                <span className="truncate">{customer.joinedDate}</span>
                            </div>
                        </div>

                        <div className="rounded-lg border overflow-hidden shadow-sm bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent">
                            <div className="bg-primary/10 dark:bg-primary/20 px-3 py-1.5 flex items-center gap-2">
                                <Shield className="h-3.5 w-3.5 text-primary" />
                                <h4 className="text-xs font-medium">Policy Summary</h4>
                            </div>
                            <div className="p-3">
                                <div className="text-2xl font-bold text-primary">{customer.policies}</div>
                                <p className="text-xs text-muted-foreground">Active Policies</p>
                            </div>
                        </div>

                        {/* Vehicles Section */}
                        <div className="rounded-lg border overflow-hidden shadow-sm bg-gradient-to-b from-blue-950/5 to-transparent dark:from-blue-950/20 dark:to-transparent">
                            <div className="px-3 py-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <Car className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <h4 className="text-sm font-medium">Vehicles</h4>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {isLoadingVehicles ? (
                                            <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                                        ) : vehicleCount}
                                    </div>
                                    <div className="flex gap-2">
                                        <CreateVehicleForm
                                            onVehicleCreated={handleVehicleCreated}
                                            clientId={customer.id}
                                            isCompact={true}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={handleViewVehicles}
                                        >
                                            <ArrowRight className="h-3.5 w-3.5 mr-1" />
                                            View
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Audit Information */}
                        <div className="rounded-lg border overflow-hidden shadow-sm bg-gradient-to-b from-muted/50 to-transparent dark:from-muted/20 dark:to-transparent">
                            <div className="bg-muted/70 dark:bg-muted/30 px-3 py-1.5 flex items-center gap-2">
                                <Info className="h-3.5 w-3.5 text-foreground/70" />
                                <h4 className="text-xs font-medium">Audit Information</h4>
                            </div>
                            <div className="p-3 space-y-2 text-xs text-muted-foreground">
                                {customer.createdBy && (
                                    <div className="flex items-center gap-2">
                                        <PenTool className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                                        <span className="truncate">Created by: {customer.createdBy}</span>
                                    </div>
                                )}
                                {customer.updatedBy && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                                        <span className="truncate">Last updated by: {customer.updatedBy}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                            <User className="h-8 w-8 text-muted-foreground/50" />
                            <p>Select a customer from the list to view details</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 