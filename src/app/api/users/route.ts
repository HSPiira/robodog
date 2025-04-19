import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services/user-service";

// GET all users
export async function GET() {
    try {
        const users = await UserService.getAllUsers();
        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

// POST create a new user
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, name, password, role, isActive } = body;

        // Validate required fields
        if (!email || !name || !password || !role) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await UserService.getUserByEmail(email);

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409 }
            );
        }

        // Create the user
        const newUser = await UserService.createUser({
            email,
            name,
            password,
            role,
            isActive,
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
} 