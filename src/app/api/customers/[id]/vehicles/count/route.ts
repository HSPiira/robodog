import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        const params = context.params;
        const id = params.id;

        // Check if customer exists
        const customer = await prisma.customer.findUnique({
            where: { id }
        });

        if (!customer) {
            return NextResponse.json(
                { error: "Customer not found" },
                { status: 404 }
            );
        }

        // Get vehicle count
        const count = await prisma.vehicle.count({
            where: {
                customerId: id,
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