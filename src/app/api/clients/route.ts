import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Prisma, Client, ClientType } from "@prisma/client";

interface SessionUser {
    id: string;
    email: string;
    name: string;
}

type ClientWithPolicyCount = Client & {
    _count: {
        policies: number;
    };
};

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const user = session.user as SessionUser;
        const body = await request.json();
        const { name, email, phone, type, address } = body;

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        // Create client
        const client = await prisma.client.create({
            data: {
                name,
                email: email || null,
                phone: phone || null,
                address: address || null,
                type: (type as ClientType) || "INDIVIDUAL", // Default to INDIVIDUAL if not provided
                isActive: true, // Default to active for new clients
                createdBy: user.email,
                updatedBy: user.email,
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

export async function GET(request: Request) {
    try {
        // Get pagination parameters from query string
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const clients = await prisma.client.findMany({
            orderBy: {
                createdAt: 'desc'
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
                        policies: true
                    }
                }
            }
        });

        // Get total count for pagination
        const totalCount = await prisma.client.count();

        // Transform the data to match the expected format
        const formattedClients = clients.map((client: ClientWithPolicyCount) => ({
            id: client.id,
            name: client.name,
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || '',
            type: client.type,
            status: client.isActive ? 'active' : 'inactive',
            policies: client._count.policies,
            joinedDate: client.createdAt.toISOString().split('T')[0],
            createdBy: client.createdBy || 'system',
            updatedBy: client.updatedBy || 'system'
        }));

        return NextResponse.json({
            data: formattedClients,
            pagination: {
                total: totalCount,
                page,
                limit,
                pages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching clients:", error);
        return NextResponse.json(
            { error: "Failed to fetch clients" },
            { status: 500 }
        );
    }
}