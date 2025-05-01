import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Validation schema for insurer creation
const insurerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format").optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
});

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

        const insurers = await prisma.insurer.findMany({
            where: {
                isActive: true,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                createdBy: true,
                updatedBy: true,
                createdByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                updatedByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: {
                name: 'asc',
            },
            take: limit,
        });

        return NextResponse.json(insurers);
    } catch (error) {
        console.error("Error fetching insurers:", error);
        return NextResponse.json(
            { error: "Failed to fetch insurers" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth(req);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();

        // Validate request body
        const validationResult = insurerSchema.safeParse(body);
        if (!validationResult.success) {
            const errors = validationResult.error.errors.map(err => `${err.path}: ${err.message}`).join(", ");
            return new NextResponse(`Validation failed: ${errors}`, { status: 400 });
        }

        const insurer = await prisma.insurer.create({
            data: {
                name: body.name,
                email: body.email,
                phone: body.phone,
                address: body.address,
                isActive: true,
                createdBy: session.user.id,
                updatedBy: session.user.id,
            },
            include: {
                createdByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                updatedByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        return NextResponse.json(insurer);
    } catch (error) {
        console.error("[INSURERS_POST]", error);
        return new NextResponse(
            error instanceof Error ? error.message : "Internal Error",
            { status: 500 }
        );
    }
} 