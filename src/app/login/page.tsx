"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import Link from "next/link";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, LogIn } from "lucide-react";

// Define the form schema
const loginFormSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    // Handle form submission
    const onSubmit = async (data: LoginFormValues) => {
        try {
            setIsSubmitting(true);
            await login(data.email, data.password);
            toast.success("Login successful");
            // Navigate to home page
            router.push("/");
            // Call refresh only if server data really needs re-fetching
            // await router.refresh();
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error instanceof Error ? error.message : "Login failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted relative">
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to home
                </Button>
                <ThemeToggle />
            </div>

            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-6">
                        <div className="flex items-center justify-center gap-2">
                            <Image
                                src="/robodog-logo.png"
                                alt="robodog"
                                width={40}
                                height={40}
                                className="h-10 w-10"
                                priority
                            />
                            <span className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
                                robodog
                            </span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                            <p className="text-sm text-muted-foreground mt-2">
                                Sign in to your account to continue
                            </p>
                        </div>
                    </div>

                    <div className="bg-card p-8 rounded-xl shadow-lg border">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your email"
                                                    type="email"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your password"
                                                    type="password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting}
                                    size="lg"
                                >
                                    {isSubmitting ? (
                                        "Signing in..."
                                    ) : (
                                        <>
                                            Sign in
                                            <LogIn className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Button variant="link" className="p-0" onClick={() => router.push("/register")}>
                                Create one now
                            </Button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 