import { db } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from './jwt';

export interface SessionUser {
    id: string;
    email?: string;
    name?: string;
    role?: string;
    isActive?: boolean;
}

/**
 * Get the authenticated user from a request
 * This is the main authentication function used throughout the app
 */
export async function auth(request?: Request) {
    try {
        // If no request is provided, we're likely in a server component or API route
        // that has no direct access to the request object
        if (!request) {
            // Log the issue for debugging
            console.warn("auth() called without request object - authentication cannot be performed");
            return { user: null };
        }

        // Get token from the request
        const token = getTokenFromRequest(request);
        if (!token) {
            return { user: null };
        }

        // Verify the token
        const payload = await verifyToken(token);
        if (!payload) {
            return { user: null };
        }

        // Get user from database to ensure they still exist and are active
        const user = await db.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
            },
        });

        if (!user || !user.isActive) {
            return { user: null };
        }

        return { user: user as SessionUser };
    } catch (error) {
        console.error("Error in auth function:", error);
        return { user: null };
    }
}

/**
 * Get the user ID from a request
 * Used for simpler cases where only the ID is needed
 */
export async function getUserFromRequest(request: Request): Promise<string | null> {
    try {
        const token = getTokenFromRequest(request);
        if (!token) {
            return null;
        }

        const payload = await verifyToken(token);
        if (!payload || typeof payload.userId !== 'string') {
            return null;
        }

        return payload.userId;
    } catch (error) {
        console.error("Error getting user from request:", error);
        return null;
    }
} 