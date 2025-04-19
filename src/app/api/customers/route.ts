import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, type } = body;

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        // Create customer
        const customer = await prisma.customer.create({
            data: {
                name,
                email: email || null,
                phone: phone || null,
                type: type || "INDIVIDUAL", // Default to INDIVIDUAL if not provided
                isActive: true, // Default to active for new customers
            },
        });

        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        console.error("Error creating customer:", error);
        return NextResponse.json(
            { error: "Failed to create customer" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                type: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: {
                        policies: true
                    }
                }
            }
        });

        // Transform the data to match the expected format
        const formattedCustomers = customers.map(customer => ({
            id: customer.id,
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone || '',
            type: customer.type,
            status: customer.isActive ? 'active' : 'inactive',
            policies: customer._count.policies,
            joinedDate: customer.createdAt.toISOString().split('T')[0]
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