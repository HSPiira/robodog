import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        const { id } = context.params;

        // Check if customer exists
        const customer = await prisma.customer.findUnique({
            where: { id }
        });

        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        // Count vehicles
        const count = await prisma.vehicle.count({
            where: {
                customerId: id,
                isActive: true
            }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error("Error counting vehicles:", error);
        return NextResponse.json(
            { error: "Failed to count vehicles" },
            { status: 500 }
        );
    }
} 