import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services/user-service";
import { generateToken } from "@/lib/jwt";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
    console.log('[API] Registration request received');
    try {
        // Log request details
        console.log('[API] Request URL:', request.url);
        console.log('[API] Request method:', request.method);
        console.log('[API] Content-Type:', request.headers.get("content-type"));

        // Ensure the request has the correct content type
        const contentType = request.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error('[API] Invalid content type:', contentType);
            return NextResponse.json(
                { error: "Content-Type must be application/json" },
                { status: 415 }
            );
        }

        const body = await request.json();
        console.log('[API] Request body:', { email: body.email, name: body.name, passwordReceived: !!body.password });

        const { email, name, password } = body;

        // Validate required fields
        if (!email || !name || !password) {
            console.error('[API] Missing required fields');
            return NextResponse.json(
                { error: "Name, email, and password are required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await UserService.getUserByEmail(email);

        if (existingUser) {
            console.log('[API] User already exists:', email);
            return NextResponse.json(
                { error: "A user with this email already exists" },
                { status: 409 }
            );
        }

        // Create the user with default role
        const newUser = await UserService.createUser({
            email,
            name,
            password,
            role: "USER", // Default role for new registrations
            isActive: true,
        });

        console.log('[API] User created successfully:', email);

        // Generate JWT token
        const token = generateToken({
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role
        });

        // Set CORS headers and create response with token
        const response = NextResponse.json({
            user: newUser,
            token: token,
            message: "Registration successful",
        });

        // Set auth token cookie that expires in 7 days
        response.cookies.set({
            name: 'auth-token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            sameSite: 'strict'
        });

        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        console.log('[API] Registration successful, sending response with token');
        return response;
    } catch (error) {
        console.error('[API] Registration error:', error);
        if (error instanceof Error) {
            console.error('[API] Error stack:', error.stack);
        }

        // Handle specific database errors
        if (error instanceof Prisma.PrismaClientInitializationError) {
            return NextResponse.json(
                { error: "Database connection error. Please try again later." },
                { status: 503 }
            );
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return NextResponse.json(
                { error: "Database error. Please try again later." },
                { status: 500 }
            );
        }
        if (error instanceof Prisma.PrismaClientRustPanicError) {
            return NextResponse.json(
                { error: "Critical database error. Please contact support." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Registration failed" },
            { status: 500 }
        );
    }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
    const response = new NextResponse(null, { status: 204 });

    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return response;
} 