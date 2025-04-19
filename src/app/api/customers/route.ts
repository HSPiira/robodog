import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                policies: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        const formattedCustomers = customers.map(customer => ({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone || "",
            status: customer.isActive ? "Active" : "Inactive",
            policies: customer.policies.length,
            joinedDate: customer.createdAt,
        }));

        return NextResponse.json(formattedCustomers);
    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json(
            { error: "Failed to fetch customers" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone } = body;

        const customer = await prisma.customer.create({
            data: {
                name,
                email,
                phone,
                isActive: true,
            },
        });

        return NextResponse.json(customer);
    } catch (error) {
        console.error("Error creating customer:", error);
        return NextResponse.json(
            { error: "Failed to create customer" },
            { status: 500 }
        );
    }
} 