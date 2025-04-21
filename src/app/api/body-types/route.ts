import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const bodyTypes = await prisma.bodyType.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                name: 'asc'
            },
            select: {
                id: true,
                name: true
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