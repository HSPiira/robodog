import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET a single vehicle by ID
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        const vehicle = await prisma.vehicle.findUnique({
            where: {
                id,
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!vehicle) {
            return NextResponse.json(
                { error: "Vehicle not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(vehicle);
    } catch (error) {
        console.error("Error fetching vehicle:", error);
        return NextResponse.json(
            { error: "Failed to fetch vehicle" },
            { status: 500 }
        );
    }
}

// PATCH to update a vehicle
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();

        // Extract fields from the body
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
            grossWeight,
        } = body;

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

        // Update the vehicle
        const updatedVehicle = await prisma.vehicle.update({
            where: {
                id,
            },
            data: {
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
                seatingCapacity: seatingCapacity || null,
                cubicCapacity: cubicCapacity || null,
                grossWeight: grossWeight || null,
            },
        });

        return NextResponse.json(updatedVehicle);
    } catch (error) {
        console.error("Error updating vehicle:", error);
        return NextResponse.json(
            { error: "Failed to update vehicle" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        const { id } = context.params;

        // Check if vehicle exists
        const existingVehicle = await prisma.vehicle.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { policies: true }
                }
            }
        });

        if (!existingVehicle) {
            return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
        }

        // Check if vehicle has policies
        if (existingVehicle._count.policies > 0) {
            return NextResponse.json(
                { error: "Cannot delete vehicle with active policies" },
                { status: 400 }
            );
        }

        // Delete vehicle
        await prisma.vehicle.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting vehicle:", error);
        return NextResponse.json(
            { error: "Failed to delete vehicle" },
            { status: 500 }
        );
    }
} 