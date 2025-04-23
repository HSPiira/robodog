import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Validation schema for insurer creation
const insurerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    phone: z.string().min(1, "Phone is required"),
});

export async function GET(req: Request) {
    try {
        const session = await auth(req);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const insurers = await db.insurer.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(insurers);
    } catch (error) {
        console.error("[INSURERS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
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
                phone: body.phone,
                isActive: true,
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