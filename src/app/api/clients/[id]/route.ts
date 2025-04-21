import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface SessionUser {
    id: string;
    email: string;
    name: string;
}

export async function GET(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        // Properly use context.params without synchronous access
        const { id } = context.params;

        const client = await prisma.client.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { policies: true }
                }
            }
        });

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        // Format the client data
        const formattedClient = {
            id: client.id,
            name: client.name,
            email: client.email || '',
            phone: client.phone || '',
            type: client.type,
            status: client.isActive ? 'active' : 'inactive',
            policies: client._count.policies,
            joinedDate: client.createdAt.toISOString().split('T')[0],
            createdBy: client.createdBy || 'system',
            updatedBy: client.updatedBy || 'system'
        };

        return NextResponse.json(formattedClient);
    } catch (error) {
        console.error("Error fetching client:", error);
        return NextResponse.json(
            { error: "Failed to fetch client" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = session.user as SessionUser;
        const { id } = context.params;
        const body = await request.json();
        const { name, email, phone, type, status, address } = body;

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        // Check if client exists
        const existingClient = await prisma.client.findUnique({
            where: { id }
        });

        if (!existingClient) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        // Update client - passing type directly without type assertion
        const updatedClient = await prisma.client.update({
            where: { id },
            data: {
                name,
                email: email || null,
                phone: phone || null,
                address: address || null,
                type,
                isActive: status === 'active',
                updatedBy: user.email
            },
            include: {
                _count: {
                    select: {
                        policies: true
                    }
                }
            }
        });

        // Format the response to match the expected format
        const formattedClient = {
            id: updatedClient.id,
            name: updatedClient.name,
            email: updatedClient.email || '',
            phone: updatedClient.phone || '',
            address: updatedClient.address || '',
            type: updatedClient.type,
            status: updatedClient.isActive ? 'active' : 'inactive',
            policies: updatedClient._count.policies,
            joinedDate: updatedClient.createdAt.toISOString().split('T')[0],
            createdBy: updatedClient.createdBy || 'system',
            updatedBy: updatedClient.updatedBy || 'system'
        };

        return NextResponse.json(formattedClient);
    } catch (error) {
        console.error("Error updating client:", error);
        return NextResponse.json(
            { error: "Failed to update client" },
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

        // Check if client exists
        const existingClient = await prisma.client.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { policies: true }
                }
            }
        });

        if (!existingClient) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        // Check if client has policies
        if (existingClient._count.policies > 0) {
            return NextResponse.json(
                { error: "Cannot delete client with active policies" },
                { status: 400 }
            );
        }

        // Delete client
        await prisma.client.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting client:", error);
        return NextResponse.json(
            { error: "Failed to delete client" },
            { status: 500 }
        );
    }
} 