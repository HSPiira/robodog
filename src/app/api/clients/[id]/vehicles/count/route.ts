import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        // Extract id from context.params (no need to await in Next.js 14+)
        const { id } = context.params;

        // Check if client exists
        const client = await prisma.client.findUnique({
            where: { id }
        });

        if (!client) {
            return NextResponse.json(
                { error: "Client not found" },
                { status: 404 }
            );
        }

        // Get vehicle count
        const count = await prisma.vehicle.count({
            where: {
                clientId: id,
                isActive: true
            }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error("Error fetching vehicle count:", error);
        return NextResponse.json(
            { error: "Failed to fetch vehicle count" },
            { status: 500 }
        );
    }
} 