import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const categories = await prisma.vehicleCategory.findMany({
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

        return NextResponse.json(categories);
    } catch (error) {
        console.error("Error fetching vehicle categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch vehicle categories" },
            { status: 500 }
        );
    }
} 