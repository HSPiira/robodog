import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET all active body types
export async function GET(request: NextRequest) {
    try {
        const includeStats = request.nextUrl.searchParams.get('include') === 'stats';

        const bodyTypes = await prisma.bodyType.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                name: 'asc'
            },
            select: {
                id: true,
                name: true,
                description: true,
                isActive: true,
                createdAt: includeStats ? true : false,
                updatedAt: includeStats ? true : false,
                ...(includeStats && {
                    _count: {
                        select: {
                            vehicles: true
                        }
                    }
                })
            }
        });

        return NextResponse.json(bodyTypes);
    } catch (error) {
        console.error("Error fetching body types:", error);
        return NextResponse.json(
            { error: "Failed to fetch body types" },
            { status: 500 }
        );
    }
}

// POST create a new body type
export async function POST(request: NextRequest) {
    try {
        // Authenticate the user
        const session = await auth(request);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extract user ID from session
        const userId = session.user.id;

        // Parse request body
        const body = await request.json();
        let { name, description } = body;
        if (typeof name === "string") {
            name = name.trim();
        }

        // Validate input
        if (!name || typeof name !== 'string' || name === '') {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        // Check if body type with the same name already exists
        const existingBodyType = await prisma.bodyType.findFirst({
            where: {
                name: { equals: name, mode: 'insensitive' },
                isActive: true
            }
        });

        if (existingBodyType) {
            return NextResponse.json(
                { error: "A body type with this name already exists" },
                { status: 409 }
            );
        }

        // Create new body type
        const bodyType = await prisma.bodyType.create({
            data: {
                name,
                description: description || null,
                isActive: true,
                createdBy: userId,
                updatedBy: userId
            }
        });

        return NextResponse.json(bodyType, { status: 201 });
    } catch (error) {
        console.error("Error creating body type:", error);
        return NextResponse.json(
            { error: "Failed to create body type" },
            { status: 500 }
        );
    }
} 