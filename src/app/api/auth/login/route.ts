import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services/user-service";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
    console.log('[API] Login request received');
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
        console.log('[API] Request body:', { email: body.email, passwordReceived: !!body.password });

        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            console.error('[API] Missing credentials');
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Verify credentials
        console.log('[API] Attempting to verify credentials for:', email);
        const user = await UserService.verifyCredentials(email, password);

        if (!user) {
            console.log('[API] Invalid credentials for:', email);
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        if (!user.isActive) {
            return NextResponse.json({ error: "Account is inactive" }, { status: 401 });
        }

        console.log('[API] User authenticated successfully:', email);

        // Check if user is active
        if (!user.isActive) {
            console.log('[API] Inactive user attempted login:', email);
            return NextResponse.json(
                { error: "Your account is inactive" },
                { status: 403 }
            );
        }

        // Return user data (excluding password)
        const { password: _, ...userWithoutPassword } = user;

        // Set CORS headers
        const response = NextResponse.json({
            user: userWithoutPassword,
            message: "Login successful",
        });

        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        console.log('[API] Login successful, sending response');
        return response;
    } catch (error) {
        console.error('[API] Login error:', error);
        if (error instanceof Error) {
            console.error('[API] Error stack:', error.stack);
        }
        return NextResponse.json(
            { error: "Authentication failed" },
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