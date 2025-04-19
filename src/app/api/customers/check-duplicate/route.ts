import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const name = searchParams.get('name');

        if (!name) {
            return NextResponse.json(
                { error: "Name parameter is required" },
                { status: 400 }
            );
        }

        // Check if a customer with this name already exists
        const existingCustomer = await prisma.customer.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive' // Case insensitive search
                }
            }
        });

        return NextResponse.json({ exists: !!existingCustomer });
    } catch (error) {
        console.error("Error checking for duplicate name:", error);
        return NextResponse.json(
            { error: "Failed to check for duplicate name" },
            { status: 500 }
        );
    }
} 