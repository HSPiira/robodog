import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET a specific vehicle type by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        const vehicleType = await prisma.vehicleType.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!vehicleType) {
            return NextResponse.json(
                { error: "Vehicle type not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(vehicleType);
    } catch (error) {
        console.error("Error fetching vehicle type:", error);
        return NextResponse.json(
            { error: "Failed to fetch vehicle type" },
            { status: 500 }
        );
    }
}

// PATCH update a vehicle type
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Authenticate the user
        const session = await auth(request);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extract user ID from session
        const userId = session.user.id;
        const id = params.id;

        // Check if vehicle type exists
        const existingVehicleType = await prisma.vehicleType.findUnique({
            where: { id }
        });

        if (!existingVehicleType) {
            return NextResponse.json(
                { error: "Vehicle type not found" },
                { status: 404 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { name, description } = body;

        // Validate input
        if (name && typeof name !== 'string') {
            return NextResponse.json(
                { error: "Invalid name format" },
                { status: 400 }
            );
        }

        // Check if the updated name conflicts with another vehicle type
        if (name && name !== existingVehicleType.name) {
            const nameConflict = await prisma.vehicleType.findFirst({
                where: {
                    name: { equals: name, mode: 'insensitive' },
                    id: { not: id },
                    isActive: true
                }
            });

            if (nameConflict) {
                return NextResponse.json(
                    { error: "A vehicle type with this name already exists" },
                    { status: 409 }
                );
            }
        }

        // Update vehicle type
        const updatedVehicleType = await prisma.vehicleType.update({
            where: { id },
            data: {
                name: name || undefined,
                description: description === undefined ? undefined : description,
                updatedBy: userId,
                updatedAt: new Date()
            },
            select: {
                id: true,
                name: true,
                description: true,
                isActive: true,
                updatedAt: true
            }
        });

        return NextResponse.json(updatedVehicleType);
    } catch (error) {
        console.error("Error updating vehicle type:", error);
        return NextResponse.json(
            { error: "Failed to update vehicle type" },
            { status: 500 }
        );
    }
}

// DELETE a vehicle type (soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Authenticate the user
        const session = await auth(request);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extract user ID from session
        const userId = session.user.id;
        const id = params.id;

        // Check if vehicle type exists
        const existingVehicleType = await prisma.vehicleType.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        vehicles: true
                    }
                }
            }
        });

        if (!existingVehicleType) {
            return NextResponse.json(
                { error: "Vehicle type not found" },
                { status: 404 }
            );
        }

        // Check if vehicle type is in use
        if (existingVehicleType._count.vehicles > 0) {
            return NextResponse.json(
                {
                    error: "Cannot delete this vehicle type because it is being used by vehicles",
                    count: existingVehicleType._count.vehicles
                },
                { status: 400 }
            );
        }

        // Soft delete the vehicle type
        await prisma.vehicleType.update({
            where: { id },
            data: {
                isActive: false,
                updatedBy: userId,
                updatedAt: new Date(),
                deletedAt: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting vehicle type:", error);
        return NextResponse.json(
            { error: "Failed to delete vehicle type" },
            { status: 500 }
        );
    }
} 