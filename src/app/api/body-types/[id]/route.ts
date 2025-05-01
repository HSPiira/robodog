import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET a specific body type by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        const bodyType = await prisma.vehicleBodyType.findUnique({
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

        if (!bodyType) {
            return NextResponse.json(
                { error: "Body type not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(bodyType);
    } catch (error) {
        console.error("Error fetching body type:", error);
        return NextResponse.json(
            { error: "Failed to fetch body type" },
            { status: 500 }
        );
    }
}

// PATCH update a body type
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

        // Check if body type exists
        const existingBodyType = await prisma.vehicleBodyType.findUnique({
            where: { id }
        });

        if (!existingBodyType) {
            return NextResponse.json(
                { error: "Body type not found" },
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

        // Check if the updated name conflicts with another body type
        if (name && name !== existingBodyType.name) {
            const nameConflict = await prisma.vehicleBodyType.findFirst({
                where: {
                    name: { equals: name.trim(), mode: 'insensitive' },
                    id: { not: id },
                    isActive: true
                }
            });

            if (nameConflict) {
                return NextResponse.json(
                    { error: "A body type with this name already exists" },
                    { status: 409 }
                );
            }
        }

        // Update body type
        const updatedBodyType = await prisma.vehicleBodyType.update({
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

        return NextResponse.json(updatedBodyType);
    } catch (error) {
        console.error("Error updating body type:", error);
        return NextResponse.json(
            { error: "Failed to update body type" },
            { status: 500 }
        );
    }
}

// DELETE a body type (soft delete)
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

        // Check if body type exists
        const existingBodyType = await prisma.vehicleBodyType.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        vehicles: true
                    }
                }
            }
        });

        if (!existingBodyType) {
            return NextResponse.json(
                { error: "Body type not found" },
                { status: 404 }
            );
        }

        // Check if body type is in use
        if (existingBodyType._count.vehicles > 0) {
            return NextResponse.json(
                {
                    error: "Cannot delete this body type because it is being used by vehicles",
                    count: existingBodyType._count.vehicles
                },
                { status: 400 }
            );
        }

        // Soft delete the body type
        await prisma.vehicleBodyType.update({
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
        console.error("Error deleting body type:", error);
        return NextResponse.json(
            { error: "Failed to delete body type" },
            { status: 500 }
        );
    }
} 