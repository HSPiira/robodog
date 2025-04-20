import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        // Properly use context.params without synchronous access
        const { id } = context.params;

        const customer = await prisma.customer.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { policies: true }
                }
            }
        });

        if (!customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        // Format the customer data
        const formattedCustomer = {
            id: customer.id,
            name: customer.name,
            email: customer.email || '',
            phone: customer.phone || '',
            // Use the type as provided by prisma directly
            type: customer.type,
            status: customer.isActive ? 'active' : 'inactive',
            policies: customer._count.policies,
            joinedDate: customer.createdAt.toISOString().split('T')[0],
            // Add dummy values for createdBy and updatedBy until schema is updated
            createdBy: "system",
            updatedBy: "system"
        };

        return NextResponse.json(formattedCustomer);
    } catch (error) {
        console.error("Error fetching customer:", error);
        return NextResponse.json(
            { error: "Failed to fetch customer" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        // Properly use context.params without synchronous access
        const { id } = context.params;

        const body = await request.json();
        const { name, email, phone, type, status } = body;

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        // Check if customer exists
        const existingCustomer = await prisma.customer.findUnique({
            where: { id }
        });

        if (!existingCustomer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        // Update customer - passing type directly without type assertion
        const updatedCustomer = await prisma.customer.update({
            where: { id },
            data: {
                name,
                email: email || null,
                phone: phone || null,
                type,
                isActive: status === 'active'
            },
        });

        return NextResponse.json(updatedCustomer);
    } catch (error) {
        console.error("Error updating customer:", error);
        return NextResponse.json(
            { error: "Failed to update customer" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        // Properly await context.params as per Next.js recommendation
        const { id } = context.params;

        // Check if customer exists
        const existingCustomer = await prisma.customer.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { policies: true }
                }
            }
        });

        if (!existingCustomer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        // Check if customer has policies
        if (existingCustomer._count.policies > 0) {
            return NextResponse.json(
                { error: "Cannot delete customer with active policies" },
                { status: 400 }
            );
        }

        // Delete customer
        await prisma.customer.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting customer:", error);
        return NextResponse.json(
            { error: "Failed to delete customer" },
            { status: 500 }
        );
    }
} 