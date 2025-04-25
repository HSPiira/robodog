import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/jwt'

// Configure the paths that don't require the middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder and its contents
         * - login page
         * - register page
         * - landing page (root path)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico|public|robodog-logo.png|login|register|$).*)',
    ],
}

export async function middleware(request: NextRequest) {
    // Get the pathname of the request (e.g. /, /api/auth/login)
    const path = request.nextUrl.pathname;

    // If it's an API route that doesn't require authentication
    if (path.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    // Get the token from the request
    const token = request.cookies.get('auth-token')?.value ||
        request.headers.get('Authorization')?.replace('Bearer ', '');

    // If no token is found, redirect to login
    if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', path);
        return NextResponse.redirect(loginUrl);
    }

    // Verify the token and check user existence
    try {
        const payload = await verifyToken(token);
        if (!payload || !payload.userId || !payload.isActive) {
            // Invalid token or inactive user, redirect to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', path);
            return NextResponse.redirect(loginUrl);
        }
    } catch (error) {
        // Token verification failed, redirect to login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', path);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}
