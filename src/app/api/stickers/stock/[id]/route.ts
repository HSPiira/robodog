import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StickerStatus } from "@prisma/client";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await auth(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const stock = await prisma.stickerStock.findUnique({
            where: { id: params.id },
            include: {
                insurer: true,
                sticker: true,
                stickerType: true,
            },
        });

        if (!stock) {
            return NextResponse.json(
                { error: "Sticker stock not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(stock);
    } catch (error) {
        console.error("Error fetching sticker stock:", error);
        return NextResponse.json(
            { error: "Failed to fetch sticker stock" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { user } = await auth(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { serialNumber, receivedAt, insurerId, stickerTypeId, stickerStatus, isIssued } = await request.json();

        // Validate required fields
        if (!serialNumber || !receivedAt || !insurerId || !stickerTypeId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Update stock
        const stock = await prisma.stickerStock.update({
            where: { id: params.id },
            data: {
                serialNumber,
                receivedAt: new Date(receivedAt),
                insurerId,
                stickerTypeId,
                stickerStatus: stickerStatus as StickerStatus,
                isIssued,
                updatedBy: user.id,
            },
            include: {
                insurer: true,
                sticker: true,
                stickerType: true,
            },
        });

        return NextResponse.json(stock);
    } catch (error: any) {
        console.error("Error updating sticker stock:", error);

        // Handle unique constraint violation
        if (error.code === "P2002") {
            return NextResponse.json(
                { error: "A sticker stock with this serial number already exists", code: "P2002" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to update sticker stock" },
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

        // Check if the stock has been issued
        const stock = await prisma.stickerStock.findUnique({
            where: { id: params.id },
            include: {
                sticker: true,
            },
        });

        if (!stock) {
            return NextResponse.json(
                { error: "Sticker stock not found" },
                { status: 404 }
            );
        }

        if (stock.isIssued || stock.sticker) {
            return NextResponse.json(
                { error: "Cannot delete sticker stock that has been issued" },
                { status: 400 }
            );
        }

        // Delete stock
        await prisma.stickerStock.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting sticker stock:", error);
        return NextResponse.json(
            { error: "Failed to delete sticker stock" },
            { status: 500 }
        );
    }
} 