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

        const { serialNumber, receivedAt, insurerId, stickerTypeId, stickerStatus } = await request.json();

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

interface SessionUser {
    id: string;
    email: string;
    name: string;
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Authenticate the user
        const session = await auth(request);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as SessionUser;

        // Verify user exists in the database
        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true },
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: "Authenticated user not found in database" },
                { status: 401 }
            );
        }

        // Check if stock exists
        const stock = await prisma.stickerStock.findUnique({
            where: { id: params.id },
        });

        if (!stock) {
            return NextResponse.json(
                { error: "Stock not found" },
                { status: 404 }
            );
        }

        // Delete the stock
        await prisma.stickerStock.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: "Stock deleted successfully" });
    } catch (error) {
        console.error("Error deleting stock:", error);
        return NextResponse.json(
            { error: "Failed to delete stock" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Authenticate the user
        const session = await auth(request);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as SessionUser;

        // Verify user exists in the database
        const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true },
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: "Authenticated user not found in database" },
                { status: 401 }
            );
        }

        // Get request body
        const body = await request.json();
        const { serialNumber, receivedAt, insurerId, stickerTypeId } = body;

        // Validate required fields
        if (!serialNumber || !receivedAt || !insurerId || !stickerTypeId) {
            return NextResponse.json(
                { error: "All fields are required" },
                { status: 400 }
            );
        }

        // Check if stock exists
        const stock = await prisma.stickerStock.findUnique({
            where: { id: params.id },
        });

        if (!stock) {
            return NextResponse.json(
                { error: "Stock not found" },
                { status: 404 }
            );
        }

        // Check if serial number is already in use
        const existingStock = await prisma.stickerStock.findUnique({
            where: { serialNumber },
        });

        if (existingStock && existingStock.id !== params.id) {
            return NextResponse.json(
                { error: "Serial number is already in use" },
                { status: 409 }
            );
        }

        // Update the stock
        const updatedStock = await prisma.stickerStock.update({
            where: { id: params.id },
            data: {
                serialNumber,
                receivedAt: new Date(receivedAt),
                insurerId,
                stickerTypeId,
                updatedBy: dbUser.id,
            },
            include: {
                insurer: true,
                sticker: {
                    include: {
                        policy: {
                            include: {
                                client: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                        vehicle: {
                            select: {
                                registrationNo: true,
                            },
                        },
                    },
                },
                stickerType: true,
            },
        });

        return NextResponse.json(updatedStock);
    } catch (error) {
        console.error("Error updating stock:", error);
        return NextResponse.json(
            { error: "Failed to update stock" },
            { status: 500 }
        );
    }
} 