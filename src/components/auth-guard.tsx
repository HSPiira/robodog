"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // If authentication is still loading, don't do anything yet
        if (loading) {
            return;
        }

        // If not authenticated, redirect to login
        if (!isAuthenticated || !user) {
            const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
            router.push(loginUrl);
            return;
        }

        // User is authenticated, allow access
        setIsAuthorized(true);
    }, [isAuthenticated, loading, pathname, router, user]);

    // Show loading state while checking authentication
    if (loading || !isAuthorized) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Render children if authorized
    return <>{children}</>;
} 