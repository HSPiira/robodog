"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = () => {
            try {
                const storedUser = localStorage.getItem("user");
                const storedToken = localStorage.getItem("token");

                console.log('[Auth] Checking stored token:', storedToken ? `${storedToken.substring(0, 20)}...` : 'null');

                if (storedUser && storedToken) {
                    try {
                        // Basic token format validation
                        if (!storedToken || typeof storedToken !== 'string') {
                            console.error('[Auth] Invalid token type:', typeof storedToken);
                            throw new Error('Invalid token type');
                        }

                        // Safely decode and validate JWT token
                        const tokenParts = storedToken.split('.');
                        console.log('[Auth] Token parts count:', tokenParts.length);

                        if (tokenParts.length !== 3) {
                            console.error('[Auth] Invalid token format - expected 3 parts, got:', tokenParts.length);
                            throw new Error('Invalid token format');
                        }

                        try {
                            // Add padding to base64 string if needed
                            const base64Url = tokenParts[1];
                            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                            const padding = base64.length % 4;
                            const paddedBase64 = padding ? base64 + '='.repeat(4 - padding) : base64;

                            const tokenData = JSON.parse(atob(paddedBase64));
                            console.log('[Auth] Token payload:', { exp: tokenData.exp });

                            const isExpired = tokenData.exp * 1000 < Date.now();
                            if (isExpired) {
                                console.warn("[Auth] Token expired on load, clearing authentication");
                                localStorage.removeItem("user");
                                localStorage.removeItem("token");
                                return;
                            }

                            const parsedUser = JSON.parse(storedUser);
                            console.log('[Auth] Restored user session:', {
                                id: parsedUser.id,
                                email: parsedUser.email,
                                role: parsedUser.role
                            });

                            setUser(parsedUser);
                            setToken(storedToken);
                        } catch (decodeError) {
                            console.error('[Auth] Token decode error:', decodeError);
                            throw new Error('Token decode failed');
                        }
                    } catch (error) {
                        console.error("[Auth] Error validating stored token:", error);
                        localStorage.removeItem("user");
                        localStorage.removeItem("token");
                        document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    }
                } else {
                    console.log('[Auth] No stored credentials found');
                }
            } catch (error) {
                console.error("[Auth] Error checking authentication:", error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Login function
    const login = async (email: string, password: string) => {
        console.log('[Auth] Starting login process for:', email);
        try {
            setLoading(true);
            const baseUrl = window.location.origin;
            const url = `${baseUrl}/api/auth/login`;
            console.log('[Auth] Making request to:', url);

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // Include cookies in the request
            });

            console.log('[Auth] Response status:', response.status);
            console.log('[Auth] Response headers:', Object.fromEntries(response.headers));

            // Log the raw response text for debugging
            const responseText = await response.text();
            console.log('[Auth] Raw response:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('[Auth] Failed to parse response as JSON:', e);
                throw new Error('Invalid response format');
            }

            if (!response.ok) {
                console.error('[Auth] Response not OK:', data);
                throw new Error(data.error || "Login failed");
            }

            // Validate token format before storing
            if (!data.token || typeof data.token !== 'string' || !data.token.includes('.')) {
                console.error('[Auth] Invalid token format in response:', data.token ? `${data.token.substring(0, 20)}...` : 'null');
                throw new Error('Invalid token format in response');
            }

            console.log('[Auth] Login successful, user data:', { ...data.user, password: undefined });

            // Store user data and token
            setUser(data.user);
            setToken(data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.token);

            // Server sets the HttpOnly cookie via Set-Cookie header
            console.log('[Auth] Login successful, cookie set by server');
        } catch (error) {
            console.error('[Auth] Login error:', error);
            console.error('[Auth] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Register function
    const register = async (name: string, email: string, password: string) => {
        console.log('[Auth] Starting registration process for:', email);
        try {
            setLoading(true);
            const baseUrl = window.location.origin;
            const url = `${baseUrl}/api/auth/register`;
            console.log('[Auth] Making request to:', url);

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            console.log('[Auth] Response status:', response.status);

            const responseText = await response.text();
            console.log('[Auth] Raw response:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error('[Auth] Failed to parse response as JSON:', e);
                throw new Error('Invalid response format');
            }

            if (!response.ok) {
                console.error('[Auth] Response not OK:', data);
                throw new Error(data.error || "Registration failed");
            }

            console.log('[Auth] Registration successful, user data:', { ...data.user, password: undefined });

            // Store user data and token and log in
            setUser(data.user);
            setToken(data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.token);

            // Server sets the HttpOnly cookie via Set-Cookie header
            console.log('[Auth] Login successful, cookie set by server');
        } catch (error) {
            console.error('[Auth] Registration error:', error);
            console.error('[Auth] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        console.log('[Auth] Logging out user');
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        // Clear the auth cookie
        document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push("/login");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!user && !!token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use the auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
} 