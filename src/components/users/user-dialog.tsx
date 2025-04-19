"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

// Define the form schema
const userFormSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }).optional(),
    role: z.string({
        required_error: "Please select a role.",
    }),
    isActive: z.boolean().default(true),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
}

interface UserDialogProps {
    open: boolean;
    onClose: (success: boolean) => void;
    user: User | null;
    isEditMode: boolean;
}

export function UserDialog({
    open,
    onClose,
    user,
    isEditMode,
}: UserDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form
    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "user",
            isActive: true,
        },
    });

    // Reset form when user changes
    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name,
                email: user.email,
                password: "", // Don't populate password for security
                role: user.role,
                isActive: user.isActive,
            });
        } else {
            form.reset({
                name: "",
                email: "",
                password: "",
                role: "user",
                isActive: true,
            });
        }
    }, [user, form]);

    // Handle form submission
    const onSubmit = async (data: UserFormValues) => {
        try {
            setIsSubmitting(true);

            // Prepare request data
            const requestData = {
                name: data.name,
                email: data.email,
                role: data.role,
                isActive: data.isActive,
            };

            // Add password only if it's provided (for new users or password changes)
            if (data.password) {
                Object.assign(requestData, { password: data.password });
            }

            // Determine the endpoint and method
            const url = isEditMode ? `/api/users/${user?.id}` : "/api/users";
            const method = isEditMode ? "PUT" : "POST";

            // Send request
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to save user");
            }

            // Close dialog with success
            onClose(true);
        } catch (error) {
            console.error("Error saving user:", error);
            // You could add toast notification here
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => onClose(false)}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? "Edit User" : "Add New User"}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter email"
                                            type="email"
                                            {...field}
                                            disabled={isEditMode}
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
                                    <FormLabel>
                                        {isEditMode ? "New Password (leave blank to keep current)" : "Password"}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter password"
                                            type="password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="user">User</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Active Status</FormLabel>
                                        <div className="text-sm text-muted-foreground">
                                            {field.value ? "User is active" : "User is inactive"}
                                        </div>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onClose(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 