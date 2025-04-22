"use client";

import { useEffect, useState, useCallback } from "react";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { VehicleDetail } from "./components/vehicle-detail";
import { CreateVehicleForm } from "./components/create-vehicle-form";
import { ImportVehicleForm } from "./components/import-vehicle-form";
import { useRouter, useSearchParams } from "next/navigation";

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
    const [showDetails, setShowDetails] = useState(false);

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

    // Toggle selected vehicle when clicking a row
    const handleVehicleSelect = (vehicle: Vehicle) => {
        if (selectedVehicle?.id === vehicle.id) {
            // If clicking the same vehicle, toggle the details panel
            setShowDetails(prev => !prev);
        } else {
            // If selecting a different vehicle, show it and open the panel
            setSelectedVehicle(vehicle);
            setShowDetails(true);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {loading && vehicles.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="flex gap-6">
                    <div className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${showDetails ? '' : 'w-full'}`}>
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
                                    <ImportVehicleForm
                                        onImportComplete={fetchVehicles}
                                        clientId={clientId || undefined}
                                    />
                                </div>
                            }
                            onRowClick={handleVehicleSelect}
                            fetchData={fetchVehicles}
                            selectedRow={selectedVehicle}
                        />
                    </div>
                    <div className={`flex-shrink-0 transition-all duration-300 ease-in-out ${showDetails ? 'w-[320px] opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
                        {selectedVehicle && (
                            <VehicleDetail
                                vehicle={selectedVehicle}
                                onCreatePolicy={handleCreatePolicy}
                                onRefresh={fetchVehicles}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
