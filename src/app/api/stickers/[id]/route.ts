import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const sticker = await prisma.sticker.update({
            where: { id: params.id },
            data: {
                isActive: false,
                deletedAt: new Date(),
            },
        });

        return NextResponse.json(sticker);
    } catch (error) {
        console.error("Error deleting sticker:", error);
        return NextResponse.json(
            { error: "Failed to delete sticker" },
            { status: 500 }
        );
    }
} 