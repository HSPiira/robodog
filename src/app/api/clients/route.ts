import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Prisma, Client, ClientType } from "@prisma/client";
import { createAuthenticatedHandler } from "@/lib/api-middleware";

interface SessionUser {
    id: string;
    email?: string;
    name?: string;
    role?: string;
}

type ClientWithPolicyCount = Client & {
    _count: {
        policies: number;
    };
};

async function createClient(request: NextRequest) {
    try {
        // Get authenticated user from the request
        const session = await auth(request);
        console.log("Session data:", JSON.stringify(session, null, 2));

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user;
        console.log("User data:", JSON.stringify(user, null, 2));

        const body = await request.json();
        const { name, email, phone, type, address } = body;

        // Validate required fields
        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        // Check if email already exists (if provided)
        if (email) {
            const existingClient = await prisma.client.findUnique({
                where: { email },
            });

            if (existingClient) {
                return NextResponse.json(
                    { error: "A client with this email already exists" },
                    { status: 409 }
                );
            }
        }

        // Get the user ID directly from the authenticated session
        // This ensures we're using the verified user ID from JWT
        const userId = user.id;

        if (!userId) {
            console.log("No user ID available in session");
            return NextResponse.json(
                { error: "User identification failed" },
                { status: 401 }
            );
        }

        // Create client
        const client = await prisma.client.create({
            data: {
                name: name.trim(),
                email: email?.trim() || null,
                phone: phone?.trim() || null,
                address: address?.trim() || null,
                type: (type as ClientType) || "INDIVIDUAL", // Default to INDIVIDUAL if not provided
                isActive: true, // Default to active for new clients
                createdBy: userId, // Store user ID from JWT
                updatedBy: userId, // Store user ID from JWT
            },
        });

        return NextResponse.json(client, { status: 201 });
    } catch (error) {
        console.error("Error creating client:", error);
        return NextResponse.json(
            { error: "Failed to create client" },
            { status: 500 }
        );
    }
}

async function getClients(request: NextRequest) {
    try {
        // Get pagination parameters from query string
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        // Fetch clients with creator and updater user information
        const clients = await prisma.client.findMany({
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                type: true,
                isActive: true,
                createdAt: true,
                createdBy: true,
                updatedBy: true,
                _count: {
                    select: {
                        policies: true,
                    },
                },
            },
        });

        // Get total count for pagination
        const totalCount = await prisma.client.count();

        // Get user names for all creator/updater IDs
        const userIds = new Set([
            ...clients.map(c => c.createdBy).filter(Boolean),
            ...clients.map(c => c.updatedBy).filter(Boolean)
        ]);

        const users = userIds.size > 0
            ? await prisma.user.findMany({
                where: {
                    id: {
                        in: Array.from(userIds) as string[]
                    }
                },
                select: {
                    id: true,
                    name: true
                }
            })
            : [];

        // Create a mapping of user IDs to names
        const userMap = new Map(users.map(user => [user.id, user.name]));

        // Transform the data to match the expected format
        const formattedClients = clients.map((client) => {
            // Get the creator/updater names from the user map if available
            const creatorName = client.createdBy ? userMap.get(client.createdBy) || "Unknown User" : "system";
            const updaterName = client.updatedBy ? userMap.get(client.updatedBy) || "Unknown User" : "system";

            return {
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
        });

        return NextResponse.json({
            data: formattedClients,
            pagination: {
                total: totalCount,
                page,
                limit,
                pages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching clients:", error);
        return NextResponse.json(
            { error: "Failed to fetch clients" },
            { status: 500 }
        );
    }
}

// Export the handlers with authentication middleware
export const POST = createAuthenticatedHandler(createClient);
export const GET = getClients; // GET doesn't require authentication
