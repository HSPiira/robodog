import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StickerStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
    try {
        const { user } = await auth(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const stocks = await prisma.stickerStock.findMany({
            include: {
                insurer: true,
                sticker: true,
                stickerType: true,
            },
            orderBy: [
                {
                    receivedAt: "desc",
                },
            ],
        });

        return NextResponse.json(stocks);
    } catch (error) {
        console.error("Error fetching stocks:", error);
        return NextResponse.json(
            { error: "Failed to fetch stocks" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { user } = await auth(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { serialNumber, receivedAt, insurerId, stickerTypeId } = await request.json();

        // Validate required fields
        if (!serialNumber || !receivedAt || !insurerId || !stickerTypeId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Create new stock
        const stock = await prisma.stickerStock.create({
            data: {
                serialNumber,
                receivedAt: new Date(receivedAt),
                insurerId,
                stickerTypeId,
                stickerStatus: StickerStatus.AVAILABLE,
                createdBy: user.id,
                updatedBy: user.id,
                isActive: true,
            },
            include: {
                insurer: true,
                sticker: true,
                stickerType: true,
            },
        });

        return NextResponse.json(stock);
    } catch (error) {
        console.error("Error creating stock:", error);
        return NextResponse.json(
            { error: "Failed to create stock" },
            { status: 500 }
        );
    }
} 