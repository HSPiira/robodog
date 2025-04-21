import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        const { id } = context.params;

        // Check if customer exists
        const customer = await prisma.customer.findUnique({
            where: { id }
        });

        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        // Get vehicles
        const vehicles = await prisma.vehicle.findMany({
            where: {
                customerId: id
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
            chassisNo: vehicle.chassisNo || vehicle.chassisNumber,
            engineNo: vehicle.engineNo || vehicle.engineNumber,
            bodyType: vehicle.bodyType,
            vehicleCategory: vehicle.vehicleCategory,
            vehicleType: vehicle.vehicleType,
            customer: {
                id: customer.id,
                name: customer.name
            },
            isActive: vehicle.isActive,
            policies: vehicle._count.policies,
            seatingCapacity: vehicle.seatingCapacity,
            grossWeight: vehicle.grossWeight,
            cubicCapacity: vehicle.cubicCapacity,
        }));

        return NextResponse.json(formattedVehicles);
    } catch (error) {
        console.error("Error fetching customer vehicles:", error);
        return NextResponse.json(
            { error: "Failed to fetch customer vehicles" },
            { status: 500 }
        );
    }
} 