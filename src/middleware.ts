import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Configure the paths that don't require the middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
    ],
}

export function middleware(request: NextRequest) {
    // Get the pathname of the request (e.g. /, /api/auth/login)
    const path = request.nextUrl.pathname;

    // If it's an API route that doesn't require authentication
    if (path.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    // For other API routes, you might want to add authentication checks here
    if (path.startsWith('/api/')) {
        // You can add authentication checks here if needed
        return NextResponse.next();
    }

    return NextResponse.next();
} 