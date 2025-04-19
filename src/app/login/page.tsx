"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
            router.push("/");
            toast.success("Login successful");
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error instanceof Error ? error.message : "Login failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-10 shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Welcome Back</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Please sign in to your account
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        >
                            {isSubmitting ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
} 