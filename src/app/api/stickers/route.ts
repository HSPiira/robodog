import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
    try {
        // Test database connection first
        await prisma.$connect();

        const stickers = await prisma.stickerIssuance.findMany({
            where: {
                isActive: true,
            },
            include: {
                policy: {
                    include: {
                        client: {
                            select: {
                                name: true,
                            },
                        },
                        vehicle: {
                            select: {
                                registrationNo: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(stickers);
    } catch (error) {
        // Log the full error details
        console.error("Detailed error:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            error
        });

        // Check for specific error types
        if (error instanceof Error) {
            if (error.message.includes("Connection refused")) {
                return NextResponse.json(
                    { error: "Database connection failed" },
                    { status: 503 }
                );
            }
            if (error.message.includes("relation") && error.message.includes("does not exist")) {
                return NextResponse.json(
                    { error: "Database tables not found. Please run migrations." },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json(
            { error: "Failed to fetch stickers", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { policyId } = body;

        // Validate required fields
        if (!policyId) {
            return NextResponse.json(
                { error: "Policy is required" },
                { status: 400 }
            );
        }

        // Get the policy to associate the vehicle
        const policy = await prisma.policy.findUnique({
            where: { id: policyId },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                vehicle: {
                    select: {
                        id: true,
                        registrationNo: true,
                    },
                },
            },
        });

        if (!policy) {
            return NextResponse.json(
                { error: "Policy not found" },
                { status: 404 }
            );
        }

        // Create the sticker
        const sticker = await prisma.stickerIssuance.create({
            data: {
                policy: {
                    connect: {
                        id: policyId,
                    },
                },
                vehicle: {
                    connect: {
                        id: policy.vehicle.id
                    }
                },
                isActive: true,
            },
            include: {
                policy: {
                    include: {
                        client: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        vehicle: {
                            select: {
                                id: true,
                                registrationNo: true,
                            },
                        },
                    },
                },
            },
        });

        return NextResponse.json(sticker);
    } catch (error) {
        console.error("Error creating sticker:", error);
        return NextResponse.json(
            { error: "Failed to create sticker" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}