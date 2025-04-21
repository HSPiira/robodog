import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            registrationNo,
            make,
            model,
            year,
            bodyTypeId,
            categoryId,
            vehicleTypeId,
            clientId,
            chassisNo,
            engineNo,
            seatingCapacity,
            cubicCapacity,
            grossWeight
        } = body;

        // Validate required fields
        if (!registrationNo || !make || !model || !bodyTypeId || !categoryId || !clientId || !chassisNo || !engineNo) {
          return res.status(400).json({ message: 'Missing required fields' });
        }
        // Verify client exists
        const client = await prisma.client.findUnique({ where: { id: clientId } });
        if (!client) {
          return res.status(404).json({ message: `Client with ID ${clientId} not found` });
        }
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if vehicle with same registration number already exists
        const existingVehicle = await prisma.vehicle.findUnique({
            where: { registrationNo: registrationNo.toUpperCase() }
        });

        if (existingVehicle) {
            return NextResponse.json(
                { error: "A vehicle with this registration number already exists" },
                { status: 409 }
            );
        }

        // Create vehicle
        const vehicle = await prisma.vehicle.create({
            data: {
                registrationNo: registrationNo.toUpperCase(),
                make,
                model,
                year,
                bodyTypeId,
                categoryId,
                vehicleTypeId,
                clientId,
                chassisNo,
                engineNo,
                engineNumber: engineNo, // Map to both fields for compatibility
                chassisNumber: chassisNo, // Map to both fields for compatibility
                seatingCapacity: seatingCapacity || null,
                cubicCapacity: cubicCapacity || null,
                grossWeight: grossWeight || null,
                isActive: true,
            },
            include: {
                bodyType: true,
                vehicleCategory: true,
                vehicleType: true,
                client: true,
            },
        });

        return NextResponse.json(vehicle, { status: 201 });
    } catch (error) {
        console.error("Error creating vehicle:", error);
        return NextResponse.json(
            { error: "Failed to create vehicle" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const vehicles = await prisma.vehicle.findMany({
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
                client: {
                    select: {
                        id: true,
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
            client: vehicle.client,
            isActive: vehicle.isActive,
            policies: vehicle._count.policies,
            seatingCapacity: vehicle.seatingCapacity,
            grossWeight: vehicle.grossWeight,
            cubicCapacity: vehicle.cubicCapacity,
        }));

        return NextResponse.json(formattedVehicles);
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        return NextResponse.json(
            { error: "Failed to fetch vehicles" },
            { status: 500 }
        );
    }
} 