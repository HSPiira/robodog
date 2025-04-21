import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { vehicles } = await request.json();

        if (!vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
            return NextResponse.json(
                { error: "No vehicles provided for import" },
                { status: 400 }
            );
        }

        // Track import stats
        const results = {
            total: vehicles.length,
            success: 0,
            failed: 0,
            vehicles: [] as any[],
        };

        // Import vehicles one by one to handle errors individually
        for (const vehicle of vehicles) {
            try {
                // Extract the necessary fields for a valid vehicle
                const vehicleData = {
                    registrationNo: vehicle.registrationNo,
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    bodyType: {
                        connect: {
                            id: vehicle.bodyTypeId
                        }
                    },
                    vehicleCategory: {
                        connect: {
                            id: vehicle.categoryId
                        }
                    },
                    vehicleType: {
                        connect: {
                            id: vehicle.vehicleTypeId
                        }
                    },
                    customer: {
                        connect: {
                            id: vehicle.customerId
                        }
                    },
                    chassisNo: vehicle.chassisNo || "",
                    engineNo: vehicle.engineNo || "",
                    chassisNumber: vehicle.chassisNo || "",
                    engineNumber: vehicle.engineNo || "",
                    seatingCapacity: vehicle.seatingCapacity || null,
                    cubicCapacity: vehicle.cubicCapacity || null,
                    grossWeight: vehicle.grossWeight || null,
                    isActive: true,
                };

                // Check if vehicle with registration number already exists
                const existingVehicle = await prisma.vehicle.findFirst({
                    where: {
                        registrationNo: vehicleData.registrationNo,
                    },
                });

                if (existingVehicle) {
                    // If vehicle exists, handle as error (you could also update instead)
                    results.failed++;
                    results.vehicles.push({
                        registrationNo: vehicleData.registrationNo,
                        status: "error",
                        message: "A vehicle with this registration number already exists",
                    });
                    continue;
                }

                // Create new vehicle
                const newVehicle = await prisma.vehicle.create({
                    data: vehicleData,
                });

                results.success++;
                results.vehicles.push({
                    id: newVehicle.id,
                    registrationNo: newVehicle.registrationNo,
                    status: "success",
                });
            } catch (vehicleError) {
                console.error("Error importing vehicle:", vehicleError, vehicle);
                results.failed++;
                results.vehicles.push({
                    registrationNo: vehicle.registrationNo || "Unknown",
                    status: "error",
                    message: "Failed to import vehicle",
                });
            }
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error("Error in vehicles import submit:", error);
        return NextResponse.json(
            { error: "Failed to process vehicle import" },
            { status: 500 }
        );
    }
} 