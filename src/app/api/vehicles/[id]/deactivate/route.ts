import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Check if the vehicle exists
        const existingVehicle = await prisma.vehicle.findUnique({
            where: {
                id,
            },
        });

        if (!existingVehicle) {
            return NextResponse.json(
                { error: "Vehicle not found" },
                { status: 404 }
            );
        }

        // Deactivate the vehicle
        const updatedVehicle = await prisma.vehicle.update({
            where: {
                id,
            },
            data: {
                isActive: false,
            },
        });

        return NextResponse.json(updatedVehicle);
    } catch (error) {
        console.error("Error deactivating vehicle:", error);
        return NextResponse.json(
            { error: "Failed to deactivate vehicle" },
            { status: 500 }
        );
    }
} 