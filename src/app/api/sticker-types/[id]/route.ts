import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await auth(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, description } = await request.json();

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        // Update sticker type
        const type = await prisma.stickerType.update({
            where: { id: params.id },
            data: {
                name,
                description,
                updatedBy: user.id,
            },
            include: {
                _count: {
                    select: {
                        stickers: true,
                    },
                },
            },
        });

        return NextResponse.json(type);
    } catch (error: any) {
        console.error("Error updating sticker type:", error);

        // Handle unique constraint violation
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "A sticker type with this name already exists", code: "P2002" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update sticker type" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await auth(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if the sticker type has any stickers
        const type = await prisma.stickerType.findUnique({
            where: { id: params.id },
            include: {
                _count: {
                    select: {
                        stickers: true,
                    },
                },
            },
        });

        if (!type) {
            return NextResponse.json(
                { error: "Sticker type not found" },
                { status: 404 }
            );
        }

        if (type._count.stickers > 0) {
            return NextResponse.json(
                { error: "Cannot delete sticker type with existing stickers" },
                { status: 400 }
            );
        }

        // Delete sticker type
        await prisma.stickerType.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting sticker type:", error);
        return NextResponse.json(
            { error: "Failed to delete sticker type" },
            { status: 500 }
        );
    }
} 