import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const vehicleTypes = await prisma.vehicleType.findMany({
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

        return NextResponse.json(vehicleTypes);
    } catch (error) {
        console.error("Error fetching vehicle types:", error);
        return NextResponse.json(
            { error: "Failed to fetch vehicle types" },
            { status: 500 }
        );
    }
} 