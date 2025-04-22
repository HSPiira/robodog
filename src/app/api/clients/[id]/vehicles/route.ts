import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        // Extract id from context.params (no need to await in Next.js 14+)
        const { id } = context.params;

        // Check if client exists
        const client = await prisma.client.findUnique({
            where: { id }
        });

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        // Get vehicles
        const vehicles = await prisma.vehicle.findMany({
            where: {
                clientId: id
            },
            orderBy: {
                registrationNo: 'asc'
            },
            include: {
                bodyType: {
                    select: {
                        name: true
                    }
                },
                vehicleCategory: {
                    select: {
                        name: true
                    }
                },
                vehicleType: {
                    select: {
                        name: true
                    }
                },
                _count: {
                    select: {
                        policies: true
                    }
                }
            }
        });

        // Transform the data to match the expected format
        const formattedVehicles = vehicles.map(vehicle => ({
            id: vehicle.id,
            registrationNo: vehicle.registrationNo,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            chassisNo: vehicle.chassisNumber,
            engineNo: vehicle.engineNumber,
            bodyType: vehicle.bodyType,
            vehicleCategory: vehicle.vehicleCategory,
            vehicleType: vehicle.vehicleType,
            client: {
                id: client.id,
                name: client.name
            },
            isActive: vehicle.isActive,
            policies: vehicle._count.policies,
            seatingCapacity: vehicle.seatingCapacity,
            grossWeight: vehicle.grossWeight,
            cubicCapacity: vehicle.cubicCapacity,
        }));

        return NextResponse.json(formattedVehicles);
    } catch (error) {
        console.error("Error fetching client vehicles:", error);
        return NextResponse.json(
            { error: "Failed to fetch client vehicles" },
            { status: 500 }
        );
    }
} 