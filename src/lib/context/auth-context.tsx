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

                if (storedUser && storedToken) {
                    setUser(JSON.parse(storedUser));
                    setToken(storedToken);
                }
            } catch (error) {
                console.error("Error checking authentication:", error);
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

            console.log('[Auth] Login successful, user data:', { ...data.user, password: undefined });

            // Store user data and token
            setUser(data.user);
            setToken(data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.token);
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