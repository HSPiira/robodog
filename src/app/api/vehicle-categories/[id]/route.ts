import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET a specific vehicle category by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        const vehicleCategory = await prisma.vehicleCategory.findUnique({
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

        if (!vehicleCategory) {
            return NextResponse.json(
                { error: "Vehicle category not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(vehicleCategory);
    } catch (error) {
        console.error("Error fetching vehicle category:", error);
        return NextResponse.json(
            { error: "Failed to fetch vehicle category" },
            { status: 500 }
        );
    }
}

// PATCH update a vehicle category
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

        // Check if vehicle category exists
        const existingVehicleCategory = await prisma.vehicleCategory.findUnique({
            where: { id }
        });

        if (!existingVehicleCategory) {
            return NextResponse.json(
                { error: "Vehicle category not found" },
                { status: 404 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { name, description } = body;

        // Validate input
        if (name !== undefined) {
            if (typeof name !== 'string') {
                return NextResponse.json(
                    { error: "Invalid name format" },
                    { status: 400 }
                );
            }

            // Check for empty string or whitespace-only string
            if (name.trim() === '') {
                return NextResponse.json(
                    { error: "Name cannot be empty" },
                    { status: 400 }
                );
            }
        }

        // Check if the updated name conflicts with another vehicle category
        if (name && name !== existingVehicleCategory.name) {
            const nameConflict = await prisma.vehicleCategory.findFirst({
                where: {
                    name: { equals: name.trim(), mode: 'insensitive' },
                    id: { not: id },
                    isActive: true
                }
            });

            if (nameConflict) {
                return NextResponse.json(
                    { error: "A vehicle category with this name already exists" },
                    { status: 409 }
                );
            }
        }

        // Update vehicle category
        const updatedVehicleCategory = await prisma.vehicleCategory.update({
            where: { id },
            data: {
                name: name ? name.trim() : undefined,
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

        return NextResponse.json(updatedVehicleCategory);
    } catch (error) {
        console.error("Error updating vehicle category:", error);
        return NextResponse.json(
            { error: "Failed to update vehicle category" },
            { status: 500 }
        );
    }
}

// DELETE a vehicle category (soft delete)
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

        // Check if vehicle category exists
        const existingVehicleCategory = await prisma.vehicleCategory.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        vehicles: true
                    }
                }
            }
        });

        if (!existingVehicleCategory) {
            return NextResponse.json(
                { error: "Vehicle category not found" },
                { status: 404 }
            );
        }

        // Check if vehicle category is in use
        if (existingVehicleCategory._count.vehicles > 0) {
            return NextResponse.json(
                {
                    error: "Cannot delete this vehicle category because it is being used by vehicles",
                    count: existingVehicleCategory._count.vehicles
                },
                { status: 400 }
            );
        }

        // Soft delete the vehicle category
        await prisma.vehicleCategory.update({
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
        console.error("Error deleting vehicle category:", error);
        return NextResponse.json(
            { error: "Failed to delete vehicle category" },
            { status: 500 }
        );
    }
} 