import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Validation schema for insurer creation
const insurerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format").optional().nullable(),
    address: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
});

export async function GET() {
    try {
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
            },
            orderBy: {
                name: 'asc',
            },
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

        const insurer = await db.insurer.create({
            data: {
                name: body.name,
                email: body.email,
                address: body.address,
                phone: body.phone,
                isActive: true,
                createdBy: session.user.id,
            },
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