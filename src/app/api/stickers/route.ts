import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Test database connection first
        await prisma.$connect();

        const stickers = await prisma.sticker.findMany({
            include: {
                policy: {
                    include: {
                        customer: {
                            select: {
                                name: true,
                            },
                        },
                        vehicle: {
                            select: {
                                registrationNo: true,
                                make: true,
                                model: true,
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