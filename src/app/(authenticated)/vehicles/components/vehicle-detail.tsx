"use client";

import { Car, Calendar, Key, User, FileText, Shield, Truck, Tag, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface VehicleDetailProps {
    vehicle?: {
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
        vehicleType?: {
            name: string;
        };
        customer: {
            id: string;
            name: string;
        };
        isActive: boolean;
        policies: number;
        seatingCapacity?: number;
        grossWeight?: number;
        cubicCapacity?: number;
    };
    onCreatePolicy?: (vehicleId: string) => void;
}

export function VehicleDetail({ vehicle, onCreatePolicy }: VehicleDetailProps) {
    // Handle create policy button click
    const handleCreatePolicy = () => {
        if (vehicle && onCreatePolicy) {
            onCreatePolicy(vehicle.id);
        }
    };

    return (
        <Card className="h-full overflow-hidden border-t-4 border-t-primary shadow-md">
            <CardHeader className="pb-3 bg-muted/30">
                <CardTitle className="text-base font-medium">Vehicle Details</CardTitle>
                <CardDescription className="text-xs">
                    {vehicle ? "View full vehicle information" : "Select a vehicle to view details"}
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {vehicle ? (
                    <div className="space-y-4 p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/15 flex-shrink-0 shadow-sm">
                                <Car className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-medium leading-none">{vehicle.registrationNo}</h3>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className={cn(
                                        "text-[10px] px-1 py-0 h-4 rounded-sm",
                                        vehicle.isActive
                                            ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                                    )}>
                                        {vehicle.isActive ? "active" : "inactive"}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3 p-3 rounded-lg bg-muted/20">
                                <h4 className="text-xs font-medium">Vehicle Information</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Truck className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                                        <span className="truncate font-medium">{vehicle.make} {vehicle.model}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                                        <span className="truncate">Year: {vehicle.year}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Tag className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                                        <span className="truncate">Category: {vehicle.vehicleCategory?.name || "—"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Info className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                                        <span className="truncate">Body Type: {vehicle.bodyType?.name || "—"}</span>
                                    </div>
                                    {vehicle.vehicleType && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Info className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                                            <span className="truncate">Type: {vehicle.vehicleType.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3 p-3 rounded-lg bg-muted/20">
                                <h4 className="text-xs font-medium">Technical Details</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Key className="h-3.5 w-3.5 text-green-500 dark:text-green-400 flex-shrink-0" />
                                        <span className="truncate">Chassis: {vehicle.chassisNo}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Key className="h-3.5 w-3.5 text-red-500 dark:text-red-400 flex-shrink-0" />
                                        <span className="truncate">Engine: {vehicle.engineNo}</span>
                                    </div>
                                    {vehicle.seatingCapacity && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <User className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                                            <span className="truncate">Seating: {vehicle.seatingCapacity} persons</span>
                                        </div>
                                    )}
                                    {vehicle.cubicCapacity && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Info className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                                            <span className="truncate">Engine Capacity: {vehicle.cubicCapacity} cc</span>
                                        </div>
                                    )}
                                    {vehicle.grossWeight && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Info className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400 flex-shrink-0" />
                                            <span className="truncate">Weight: {vehicle.grossWeight} kg</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 p-3 rounded-lg bg-muted/20">
                            <h4 className="text-xs font-medium">Ownership</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <User className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                    <span className="truncate">
                                        Owner: <span className="font-medium">{vehicle.customer?.name || "—"}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border overflow-hidden shadow-sm bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent">
                            <div className="bg-primary/10 dark:bg-primary/20 px-3 py-1.5 flex items-center gap-2">
                                <Shield className="h-3.5 w-3.5 text-primary" />
                                <h4 className="text-xs font-medium">Policy Summary</h4>
                            </div>
                            <div className="p-3">
                                <div className="text-2xl font-bold text-primary">{vehicle.policies || 0}</div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground">Active Policies</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={handleCreatePolicy}
                                    >
                                        <FileText className="h-3.5 w-3.5 mr-1" />
                                        New Policy
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                            <Car className="h-8 w-8 text-muted-foreground/50" />
                            <p>Select a vehicle from the list to view details</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 