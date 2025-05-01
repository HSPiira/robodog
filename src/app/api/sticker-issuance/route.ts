import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StickerStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
    try {
        const session = await auth(request);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const stickers = await prisma.stickerIssuance.findMany({
            where: {
                isActive: true,
            },
            select: {
                id: true,
                createdAt: true,
                stock: {
                    select: {
                        serialNumber: true,
                    },
                },
                policy: {
                    select: {
                        policyNo: true,
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
            orderBy: {
                createdAt: "desc",
            },
        });

        // Transform the data to match the expected format
        const formattedStickers = stickers.map(sticker => ({
            id: sticker.id,
            serialNumber: sticker.stock?.serialNumber || "N/A",
            createdAt: sticker.createdAt,
            policy: sticker.policy ? {
                policyNo: sticker.policy.policyNo,
                vehicle: {
                    registrationNo: sticker.vehicle?.registrationNo || null,
                },
                client: sticker.policy.client,
            } : null,
        }));

        return NextResponse.json(formattedStickers);
    } catch (error) {
        console.error("Error fetching stickers:", error);
        return NextResponse.json(
            { error: "Failed to fetch stickers" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth(request);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { vehicleId, policyId, stockId, stickerTypeId } = await request.json();

        // Validate required fields
        if (!vehicleId || !stockId || !stickerTypeId) {
            return NextResponse.json(
                { error: "Vehicle, stock, and sticker type are required" },
                { status: 400 }
            );
        }

        // Check if stock exists and is available
        const stock = await prisma.stickerStock.findUnique({
            where: { id: stockId },
        });

        if (!stock) {
            return NextResponse.json(
                { error: "Stock not found" },
                { status: 404 }
            );
        }

        if (stock.stickerStatus !== StickerStatus.AVAILABLE) {
            return NextResponse.json(
                { error: "Stock is not available" },
                { status: 400 }
            );
        }

        // Create sticker issuance and update stock status in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create sticker issuance
            const issuance = await tx.stickerIssuance.create({
                data: {
                    vehicleId,
                    ...(policyId && { policyId }), // Only include policyId if it exists
                    stockId,
                    stickerTypeId,
                    issuedAt: new Date(),
                    issuedBy: session.user.id,
                    createdBy: session.user.id,
                    updatedBy: session.user.id,
                    isActive: true,
                },
                include: {
                    vehicle: {
                        select: {
                            registrationNo: true,
                        },
                    },
                    policy: {
                        select: {
                            policyNo: true,
                            client: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                    stock: {
                        select: {
                            serialNumber: true,
                        },
                    },
                },
            });

            // Update stock status
            await tx.stickerStock.update({
                where: { id: stockId },
                data: {
                    stickerStatus: StickerStatus.ISSUED,
                    updatedBy: session.user.id,
                },
            });

            return issuance;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error creating sticker issuance:", error);

        // Check for specific error types and return appropriate messages
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2003') {
                return NextResponse.json(
                    { error: "Invalid policy or vehicle reference" },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            { error: "Failed to create sticker issuance" },
            { status: 500 }
        );
    }
} 