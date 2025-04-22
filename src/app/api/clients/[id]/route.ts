import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createAuthenticatedHandler } from "@/lib/api-middleware";

interface SessionUser {
    id: string;
    email?: string;
    name?: string;
    role?: string;
}

// Client interface to match Prisma schema
interface ClientData {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    type: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string | null;
    updatedBy: string | null;
    deletedAt: Date | null;
    _count?: {
        policies: number;
    };
}

// Helper function to get user names from IDs
async function getUserNames(userIds: string[]): Promise<Map<string, string>> {
    if (!userIds.length) return new Map();

    const users = await prisma.user.findMany({
        where: {
            id: {
                in: userIds,
            },
        },
        select: {
            id: true,
            name: true,
        },
    });

    return new Map(users.map((user) => [user.id, user.name]));
}

// Get a client by ID
async function getClient(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        // Properly use context.params without synchronous access
        const { id } = context.params;

        const client = await prisma.client.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { policies: true },
                },
            },
        });

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        // Get user names for creator and updater if they exist
        const userIds = [client.createdBy, client.updatedBy].filter(
            Boolean
        ) as string[];
        const userMap = await getUserNames(userIds);

        // Get the creator/updater names
        const creatorName = client.createdBy
            ? userMap.get(client.createdBy) || "Unknown User"
            : "system";
        const updaterName = client.updatedBy
            ? userMap.get(client.updatedBy) || "system"
            : "system";

        // Format the client data
        const formattedClient = {
            id: client.id,
            name: client.name,
            email: client.email || "",
            phone: client.phone || "",
            address: client.address || "",
            type: client.type,
            status: client.isActive ? "active" : "inactive",
            policies: client._count.policies,
            joinedDate: client.createdAt.toISOString().split("T")[0],
            createdBy: creatorName,
            updatedBy: updaterName,
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

// Update a client - requires authentication
async function updateClient(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        // Get authenticated user from the request
        const session = await auth(request);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as SessionUser;
        const { id } = context.params;
        const body = await request.json();
        const { name, email, phone, type, status, address } = body;

        // Validate required fields
        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        // Check if client exists
        const existingClient = await prisma.client.findUnique({
            where: { id },
        });

        if (!existingClient) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        // Update client
        const updatedClient = await prisma.client.update({
            where: { id },
            data: {
                name,
                email: email || null,
                phone: phone || null,
                address: address || null,
                type,
                isActive: status === "active",
                updatedBy: user.id, // Use user ID from JWT
            },
            include: {
                _count: {
                    select: {
                        policies: true,
                    },
                },
            },
        });

        // Get user names for creator and updater
        const userIds = [updatedClient.createdBy, updatedClient.updatedBy].filter(
            Boolean
        ) as string[];
        const userMap = await getUserNames(userIds);

        // Get the creator/updater names
        const creatorName = updatedClient.createdBy
            ? userMap.get(updatedClient.createdBy) || "Unknown User"
            : "system";
        const updaterName = updatedClient.updatedBy
            ? userMap.get(updatedClient.updatedBy) || "Unknown User"
            : "system";

        // Format the response to match the expected format
        const formattedClient = {
            id: updatedClient.id,
            name: updatedClient.name,
            email: updatedClient.email || "",
            phone: updatedClient.phone || "",
            address: updatedClient.address || "",
            type: updatedClient.type,
            status: updatedClient.isActive ? "active" : "inactive",
            policies: updatedClient._count.policies,
            joinedDate: updatedClient.createdAt.toISOString().split("T")[0],
            createdBy: creatorName,
            updatedBy: updaterName,
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

// Delete a client - requires authentication
async function deleteClient(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        // Get authenticated user from the request
        const session = await auth(request);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Extract id from context.params (no need to await in Next.js 14+)
        const { id } = context.params;

        // Check if client exists
        const existingClient = await prisma.client.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { policies: true },
                },
            },
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
            where: { id },
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

// Export the handlers with authentication middleware
export const GET = createAuthenticatedHandler(getClient);
export const PATCH = createAuthenticatedHandler(updateClient);
export const DELETE = createAuthenticatedHandler(deleteClient);
