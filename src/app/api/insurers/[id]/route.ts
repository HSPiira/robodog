import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

interface RouteContext {
    params: {
        id: string;
    };
}

// Validation schema for insurer update
const insurerUpdateSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email format").optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, context: RouteContext) {
    try {
        const session = await auth(req);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = context.params;
        const body = await req.json();

        // Validate request body
        const validationResult = insurerUpdateSchema.safeParse(body);
        if (!validationResult.success) {
            const errors = validationResult.error.errors.map(err => `${err.path}: ${err.message}`).join(", ");
            return new NextResponse(`Validation failed: ${errors}`, { status: 400 });
        }

        const data = validationResult.data;

        // Add updatedBy field
        const updateData = {
            ...data,
            updatedBy: session.user.id,
        };

        const insurer = await db.insurer.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(insurer);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            return new NextResponse("Insurer not found", { status: 404 });
        }
        console.error("[INSURER_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request, context: RouteContext) {
    try {
        const session = await auth(req);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = context.params;

        await db.insurer.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            return new NextResponse("Insurer not found", { status: 404 });
        }
        console.error("[INSURER_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
} 