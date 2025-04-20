"use client";

import { useEffect, useState, useCallback } from "react";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { VehicleDetail } from "./components/vehicle-detail";
import { CreateVehicleForm } from "./components/create-vehicle-form";
import { BulkVehicleUpload } from "./components/bulk-vehicle-upload";
import { useRouter, useSearchParams } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { ChevronRight, Home, User } from "lucide-react";

interface Vehicle {
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
    vehicleType: {
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
}

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [customerName, setCustomerName] = useState<string>("");

    const router = useRouter();
    const searchParams = useSearchParams();
    const customerId = searchParams.get('customerId');

    // Fetch vehicles data
    const fetchVehicles = useCallback(async () => {
        try {
            setLoading(true);
            let url = "/api/vehicles";

            // If customerId is provided, fetch only vehicles for that customer
            if (customerId) {
                url = `/api/customers/${customerId}/vehicles`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Failed to fetch vehicles");
            }
            const data = await response.json();
            setVehicles(data);

            // If there are vehicles and they have a customer, set the customer name
            if (data.length > 0 && data[0].customer) {
                setCustomerName(data[0].customer.name);
            }
        } catch (error) {
            console.error("Error fetching vehicles:", error);
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    // Handle creating a new policy for a vehicle
    const handleCreatePolicy = (vehicleId: string) => {
        router.push(`/policies/create?vehicleId=${vehicleId}`);
    };

    return (
        <div className="p-6 space-y-6">
            {customerId && (
                <div className="flex items-center justify-between">
                    <div>
                        <Breadcrumb className="mt-1">
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/clients" className="text-xs text-muted-foreground flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    Clients
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <BreadcrumbLink className="text-xs font-medium flex items-center">
                                    {customerName || 'Customer Vehicles'}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </Breadcrumb>
                    </div>
                </div>
            )}

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
                                <div className="flex items-center">
                                    <CreateVehicleForm
                                        onVehicleCreated={fetchVehicles}
                                        customerId={customerId || undefined}
                                    />
                                    <BulkVehicleUpload
                                        onUploadComplete={fetchVehicles}
                                        customerId={customerId || undefined}
                                    />
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