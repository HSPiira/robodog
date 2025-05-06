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
            where: {},
            select: {
                id: true,
                createdAt: true,
                issuedAt: true,
                validFrom: true,
                validTo: true,
                isActive: true,
                stock: {
                    select: {
                        serialNumber: true,
                        stickerType: {
                            select: {
                                name: true,
                            },
                        },
                        insurer: {
                            select: {
                                name: true,
                            },
                        },
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
                        client: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                issuedByUser: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        console.log('Raw stickers from Prisma:', JSON.stringify(stickers, null, 2));

        // Transform the data to match the expected format
        const formattedStickers = stickers.map(sticker => ({
            id: sticker.id,
            serialNumber: sticker.stock?.serialNumber || "N/A",
            createdAt: sticker.createdAt,
            issuedAt: sticker.issuedAt || sticker.createdAt,
            validFrom: sticker.validFrom,
            validTo: sticker.validTo,
            isActive: sticker.isActive,
            vehicle: {
                registrationNo: sticker.vehicle?.registrationNo || "N/A",
                client: sticker.vehicle?.client || null,
            },
            policy: sticker.policy ? {
                policyNo: sticker.policy.policyNo,
                client: sticker.policy.client,
            } : null,
            stock: {
                serialNumber: sticker.stock?.serialNumber || "N/A",
                stickerType: {
                    name: sticker.stock?.stickerType?.name || "N/A",
                },
                insurer: {
                    name: sticker.stock?.insurer?.name || "N/A",
                },
            },
            issuedByUser: sticker.issuedByUser ? { name: sticker.issuedByUser.name } : null,
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

        const body = await request.json();
        const { vehicleId, policyId, stockId, stickerTypeId, validFrom: validFromInput, validTo: validToInput } = body;

        // Validate required fields
        if (!vehicleId || !stockId || !stickerTypeId || !validFromInput || !validToInput) {
            return NextResponse.json(
                { error: "Vehicle, stock, sticker type, and validity dates are required" },
                { status: 400 }
            );
        }

        // Check if vehicle already has an active sticker
        const existingSticker = await prisma.stickerIssuance.findFirst({
            where: {
                vehicleId,
                isActive: true,
            },
        });

        if (existingSticker) {
            return NextResponse.json(
                { error: "This vehicle already has an active sticker" },
                { status: 400 }
            );
        }

        // Check if stock exists and is available
        const stock = await prisma.stickerStock.findUnique({
            where: { id: stockId },
            include: {
                sticker: true,
            },
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

        if (stock.sticker) {
            return NextResponse.json(
                { error: "This stock has already been issued" },
                { status: 400 }
            );
        }

        // Create sticker issuance and update stock status in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const issuedAt = new Date();
            // validFrom can be provided, otherwise use issuedAt
            const validFrom = new Date(validFromInput);
            // validTo is always 1 year after validFrom
            const validTo = new Date(validToInput);
            validTo.setFullYear(validTo.getFullYear() + 1);
            // Create sticker issuance
            const issuance = await tx.stickerIssuance.create({
                data: {
                    vehicleId,
                    ...(policyId && { policyId }),
                    stockId,
                    stickerTypeId,
                    issuedAt,
                    validFrom,
                    validTo,
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

            // Update stock status to ISSUED
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

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return NextResponse.json(
                    { error: "This stock has already been issued" },
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