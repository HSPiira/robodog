"use client";

import { useEffect, useState, useCallback } from "react";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { VehicleDetail } from "./components/vehicle-detail";
import { CreateVehicleForm } from "./components/create-vehicle-form";
import { BulkVehicleUpload } from "./components/bulk-vehicle-upload";
import { useRouter, useSearchParams } from "next/navigation";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface Vehicle {
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
    vehicleType: {
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
}

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [clientName, setClientName] = useState<string>("");

    const router = useRouter();
    const searchParams = useSearchParams();
    const clientId = searchParams.get("clientId");

    // Fetch vehicles data
    const fetchVehicles = useCallback(async () => {
        try {
            setLoading(true);
            let url = "/api/vehicles";

            // If clientId is provided, fetch only vehicles for that client
            if (clientId) {
                url = `/api/clients/${clientId}/vehicles`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Failed to fetch vehicles");
            }
            const data = await response.json();
            setVehicles(data);

            // If there are vehicles and they have a client, set the client name
            if (data.length > 0 && data[0].client) {
                setClientName(data[0].client.name);
            }
        } catch (error) {
            console.error("Error fetching vehicles:", error);
        } finally {
            setLoading(false);
        }
    }, [clientId]);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    // Handle creating a new policy for a vehicle
    const handleCreatePolicy = (vehicleId: string) => {
        router.push(`/policies/create?vehicleId=${vehicleId}`);
    };

    // Navigate to bulk import page
    const navigateToImport = () => {
        router.push("/vehicles/import");
    };

    return (
        <div className="p-6 space-y-6">
            {loading && vehicles.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="flex gap-6 overflow-x-auto">
                    <div className="flex-1 min-w-0">
                        <DataTable
                            columns={columns}
                            data={vehicles}
                            searchKey="registrationNo"
                            actionButton={
                                <div className="flex items-center gap-2">
                                    <CreateVehicleForm
                                        onVehicleCreated={fetchVehicles}
                                        clientId={clientId || undefined}
                                    />
                                    <BulkVehicleUpload
                                        onUploadComplete={fetchVehicles}
                                        clientId={clientId || undefined}
                                    />
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={navigateToImport}
                                                    className="h-8 w-8 rounded-full"
                                                    aria-label="Go to bulk import"
                                                >
                                                    <FileUp className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom" className="text-xs">
                                                Go to bulk import
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            }
                            onRowClick={(vehicle) => setSelectedVehicle(vehicle as Vehicle)}
                            fetchData={fetchVehicles}
                        />
                    </div>
                    <div className="w-[300px] flex-shrink-0">
                        <VehicleDetail
                            vehicle={selectedVehicle || undefined}
                            onCreatePolicy={handleCreatePolicy}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
