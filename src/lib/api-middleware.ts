import { NextRequest, NextResponse } from 'next/server';
import { auth } from './auth';

/**
 * Middleware to verify authentication for API routes
 * 
 * @param request The incoming request
 * @returns Response or null to continue
 */
export async function withAuth<T extends object>(
    request: NextRequest,
    handler: (req: NextRequest, context: T) => Promise<NextResponse>,
    context: T
): Promise<NextResponse> {
    try {
        // Check authentication
        const session = await auth(request);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Authentication successful, proceed with the handler
        return handler(request, context);
    } catch (error) {
        console.error('Auth middleware error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * Helper function for wrapping API route handlers with authentication
 * 
 * Supports handlers with context parameter (like route handlers with params)
 */
export function createAuthenticatedHandler<T extends object = any>(
    handler: (req: NextRequest, context: T) => Promise<NextResponse>
) {
    // Return a handler function with the correct signature for Next.js routes
    return (request: NextRequest, context: T) => {
        return withAuth(request, handler, context);
    };
} 