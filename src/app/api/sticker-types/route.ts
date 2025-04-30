import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const { user } = await auth(request);
        if (!user || !user.role || !['ADMIN', 'MANAGER'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const types = await prisma.stickerType.findMany({
            where: { isActive: true },
            include: {
                _count: {
                    select: {
                        StickerStock: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json(types);
    } catch (error) {
        console.error("Error fetching sticker types:", error);
        return NextResponse.json(
            { error: "Failed to fetch sticker types" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { user } = await auth(request);
        if (!user || !user.role || !['ADMIN', 'MANAGER'].includes(user.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { name, description } = await request.json();

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        // Create new sticker type
        const type = await prisma.stickerType.create({
            data: {
                name,
                description,
                createdBy: user.id,
                updatedBy: user.id,
                isActive: true,
            },
            include: {
                _count: {
                    select: {
                        StickerStock: true,
                    },
                },
            },
        });

        return NextResponse.json(type);
    } catch (error: any) {
        console.error("Error creating sticker type:", error);

        // Handle unique constraint violation
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "A sticker type with this name already exists", code: "P2002" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create sticker type" },
            { status: 500 }
        );
    }
} 