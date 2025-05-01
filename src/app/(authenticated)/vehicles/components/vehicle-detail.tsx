"use client";

import { Car, Calendar, Key, User, Tag, Info, CheckCircle, XCircle, Truck, CircuitBoard, Users, Weight, Gauge, MoreHorizontal, ArchiveX, Edit, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditVehicleForm } from "./edit-vehicle-form";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface VehicleDetailProps {
    vehicle?: {
        id: string;
        registrationNo: string;
        make: string;
        model: string;
        year: number;
        chassisNumber: string;
        engineNumber: string;
        bodyType: {
            name: string;
        };
        vehicleCategory: {
            name: string;
        };
        vehicleType?: {
            name: string;
        };
        client: {
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
    onRefresh?: () => void;
}

export function VehicleDetail({ vehicle, onCreatePolicy, onRefresh }: VehicleDetailProps) {
    const [isDeactivating, setIsDeactivating] = useState(false);

    if (!vehicle) {
        return (
            <Card className="h-full flex items-center justify-center">
                <div className="text-center p-6 opacity-70">
                    <Car className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs">Select a vehicle to view details</p>
                </div>
            </Card>
        );
    }

    const handleDeactivate = async () => {
        if (!vehicle || isDeactivating) return;

        setIsDeactivating(true);
        try {
            const response = await fetch(`/api/vehicles/${vehicle.id}/deactivate`, {
                method: 'POST',
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast({
                    title: "Deactivation failed",
                    description: errorData.error || "Failed to deactivate vehicle",
                    variant: "destructive"
                });
                throw new Error('Failed to deactivate vehicle');
            }

            // Refresh data
            onRefresh?.();
        } catch (error) {
            console.error('Error deactivating vehicle:', error);
            toast({
                title: "Deactivation failed",
                description: "Failed to deactivate vehicle. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsDeactivating(false);
        }
    };

    return (
        <Card className="h-full shadow-sm">
            <CardHeader className="border-b pb-2.5">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center mr-2">
                            <Car className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <CardTitle className="text-base whitespace-nowrap">{vehicle.registrationNo}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        {vehicle.isActive ? (
                            <div className="flex items-center text-xs text-green-600">
                                <CheckCircle className="h-3.5 w-3.5 mr-1 stroke-2" />Active
                            </div>
                        ) : (
                            <div className="flex items-center text-xs text-amber-600">
                                <XCircle className="h-3.5 w-3.5 mr-1 stroke-2" />Inactive
                            </div>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs">Vehicle Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <EditVehicleForm
                                    vehicleId={vehicle.id}
                                    trigger={
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 text-xs cursor-pointer">
                                            <Edit className="h-3.5 w-3.5" />
                                            Edit vehicle
                                        </DropdownMenuItem>
                                    }
                                    onVehicleUpdated={() => {
                                        if (onRefresh) onRefresh();
                                    }}
                                />
                                {vehicle.isActive && (
                                    <DropdownMenuItem
                                        className="gap-2 text-xs text-destructive cursor-pointer"
                                        onClick={handleDeactivate}
                                        disabled={isDeactivating}
                                    >
                                        <ArchiveX className="h-3.5 w-3.5" />
                                        {isDeactivating ? 'Deactivating...' : 'Deactivate'}
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-3">
                <div className="space-y-4">
                    {/* Main details */}
                    <div className="pb-2.5 border-b">
                        <div className="flex items-center mb-1.5">
                            <Truck className="h-3.5 w-3.5 text-blue-500 mr-1.5 flex-shrink-0" />
                            <h3 className="font-medium text-sm truncate">
                                {vehicle.make} {vehicle.model}
                            </h3>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground pl-5">
                            <Calendar className="h-3 w-3 inline mr-1 text-orange-500 flex-shrink-0" />
                            {vehicle.year}
                            <span className="mx-1.5">•</span>
                            <Tag className="h-3 w-3 inline mr-1 text-purple-500 flex-shrink-0" />
                            <span className="truncate">{vehicle.vehicleCategory?.name}</span>
                            <span className="mx-1.5">•</span>
                            <Info className="h-3 w-3 inline mr-1 text-indigo-500 flex-shrink-0" />
                            <span className="truncate">{vehicle.bodyType?.name}</span>
                        </div>
                        <div className="flex items-center text-xs mt-2 pl-5">
                            <User className="h-3 w-3 mr-1.5 text-primary flex-shrink-0" />
                            Owner: <span className="font-medium ml-1 truncate max-w-[180px] inline-block">{vehicle.client?.name}</span>
                        </div>
                    </div>

                    {/* Technical details */}
                    <div>
                        <h4 className="font-medium text-xs mb-3 flex items-center">
                            <CircuitBoard className="h-3.5 w-3.5 text-primary mr-1.5 flex-shrink-0" />
                            Technical Information
                        </h4>

                        <div className="space-y-2.5">
                            <div className="flex items-center">
                                <Key className="h-3.5 w-3.5 text-green-500 mr-2 flex-shrink-0" />
                                <span className="text-xs text-muted-foreground">Chassis No</span>
                                <span className="text-xs text-muted-foreground mx-1">:</span>
                                <span className="text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                    {vehicle.chassisNumber || "—"}
                                </span>
                            </div>

                            <div className="flex items-center">
                                <Key className="h-3.5 w-3.5 text-red-500 mr-2 flex-shrink-0" />
                                <span className="text-xs text-muted-foreground">Engine No</span>
                                <span className="text-xs text-muted-foreground mx-1">:</span>
                                <span className="text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                    {vehicle.engineNumber || "—"}
                                </span>
                            </div>

                            {vehicle.vehicleType && (
                                <div className="flex items-center">
                                    <Car className="h-3.5 w-3.5 text-emerald-500 mr-2 flex-shrink-0" />
                                    <span className="text-xs text-muted-foreground">Type</span>
                                    <span className="text-xs text-muted-foreground mx-1">:</span>
                                    <span className="text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                        {vehicle.vehicleType.name}
                                    </span>
                                </div>
                            )}

                            {vehicle.seatingCapacity && (
                                <div className="flex items-center">
                                    <Users className="h-3.5 w-3.5 text-blue-500 mr-2 flex-shrink-0" />
                                    <span className="text-xs text-muted-foreground">Seating</span>
                                    <span className="text-xs text-muted-foreground mx-1">:</span>
                                    <span className="text-xs font-medium whitespace-nowrap">
                                        {vehicle.seatingCapacity} persons
                                    </span>
                                </div>
                            )}

                            {vehicle.cubicCapacity && (
                                <div className="flex items-center">
                                    <Gauge className="h-3.5 w-3.5 text-amber-500 mr-2 flex-shrink-0" />
                                    <span className="text-xs text-muted-foreground">Engine Capacity</span>
                                    <span className="text-xs text-muted-foreground mx-1">:</span>
                                    <span className="text-xs font-medium whitespace-nowrap">
                                        {vehicle.cubicCapacity} cc
                                    </span>
                                </div>
                            )}

                            {vehicle.grossWeight && (
                                <div className="flex items-center">
                                    <Weight className="h-3.5 w-3.5 text-violet-500 mr-2 flex-shrink-0" />
                                    <span className="text-xs text-muted-foreground">Weight</span>
                                    <span className="text-xs text-muted-foreground mx-1">:</span>
                                    <span className="text-xs font-medium whitespace-nowrap">
                                        {vehicle.grossWeight} kg
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    {onCreatePolicy && (
                        <div className="pt-3 mt-2 border-t">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="default"
                                            onClick={() => onCreatePolicy(vehicle.id)}
                                            className="h-7 w-7 rounded-full"
                                        >
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Create new policy</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 