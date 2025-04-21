import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const name = url.searchParams.get('name');

        if (!name) {
            return NextResponse.json(
                { error: "Name parameter is required" },
                { status: 400 }
            );
        }

        // @ts-ignore - client model exists in Prisma but TypeScript doesn't recognize it
        const existingClient = await prisma.client.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive' // Case insensitive search
                }
            }
        });

        return NextResponse.json({
            exists: !!existingClient,
            client: existingClient ? {
                id: existingClient.id,
                name: existingClient.name
            } : null
        });
    } catch (error) {
        console.error("Error checking duplicate client:", error);
        return NextResponse.json(
            { error: "Failed to check for duplicate client" },
            { status: 500 }
        );
    }
} 