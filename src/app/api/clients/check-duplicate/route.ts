import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createAuthenticatedHandler } from "@/lib/api-middleware";

/**
 * Check if a client with a given name already exists (case-insensitive exact match)
 * This endpoint is used by the client creation form to prevent duplicates
 */
async function checkDuplicate(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const name = url.searchParams.get('name');

        if (!name) {
            return NextResponse.json(
                { error: "Name parameter is required" },
                { status: 400 }
            );
        }

        const trimmedName = name.trim();

        // Log the request for debugging
        console.log(`[API] Checking for client name duplicate: "${trimmedName}"`);

        // Find a client with exactly the same name (case insensitive)
        const existingClient = await prisma.client.findFirst({
            where: {
                name: {
                    equals: trimmedName,
                    mode: 'insensitive'
                }
            },
            select: {
                id: true,
                name: true,
                email: true
            }
        });

        const exists = !!existingClient;

        // Log the results
        if (exists) {
            console.log(`[API] Found existing client with name: "${existingClient.name}" (ID: ${existingClient.id})`);
        } else {
            console.log(`[API] No client found with name: "${trimmedName}"`);
        }

        // Return result
        return NextResponse.json({
            exists,
            client: existingClient ? {
                id: existingClient.id,
                name: existingClient.name,
                email: existingClient.email
            } : null
        });
    } catch (error) {
        console.error("[API] Error checking duplicate client:", error);
        return NextResponse.json(
            { error: "Failed to check for duplicate client" },
            { status: 500 }
        );
    }
}

// Export the endpoint with authentication (the client UI will send the JWT token)
export const GET = createAuthenticatedHandler(checkDuplicate); 