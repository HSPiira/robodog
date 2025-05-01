import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

interface VehicleResponse {
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
    seatingCapacity: number | null;
    grossWeight: number | null;
    cubicCapacity: number | null;
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Authenticate the user
        const session = await auth(request);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        // Verify client exists
        const client = await prisma.client.findUnique({
            where: { id },
        });

        if (!client) {
            return NextResponse.json(
                { error: `Client with ID ${id} not found` },
                { status: 404 }
            );
        }

        const vehicles = await prisma.vehicle.findMany({
            where: {
                clientId: id,
            },
            orderBy: {
                registrationNo: "asc",
            },
            include: {
                bodyType: {
                    select: {
                        name: true,
                    },
                },
                vehicleCategory: {
                    select: {
                        name: true,
                    },
                },
                vehicleType: {
                    select: {
                        name: true,
                    },
                },
                client: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        stickers: true,
                    },
                },
            },
        });

        // Transform the data to match the expected format
        const formattedVehicles: VehicleResponse[] = vehicles.map((vehicle) => ({
            id: vehicle.id,
            registrationNo: vehicle.registrationNo,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            chassisNumber: vehicle.chassisNumber,
            engineNumber: vehicle.engineNumber,
            bodyType: vehicle.bodyType,
            vehicleCategory: vehicle.vehicleCategory,
            vehicleType: vehicle.vehicleType,
            client: vehicle.client,
            isActive: vehicle.isActive,
            policies: vehicle._count.stickers,
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