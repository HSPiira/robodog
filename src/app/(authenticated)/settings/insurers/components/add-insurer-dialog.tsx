"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Building2, Mail, Phone, MapPin, Loader2 } from "lucide-react";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }).optional().or(z.literal("")),
    phone: z
        .string()
        .regex(/^\+?[0-9]{10,15}$/, {
            message: "Enter a valid phone number (digits only, 10-15 chars).",
        })
        .optional()
        .or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface AddInsurerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function AddInsurerDialog({
    open,
    onOpenChange,
    onSuccess,
}: AddInsurerDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
        },
    });

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true);
        const ac = new AbortController();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/insurers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                signal: ac.signal,
                body: JSON.stringify({
                    ...data,
                    email: data.email || null,
                    phone: data.phone || null,
                    address: data.address || null,
                    isActive: true,
                }),
            });

            if (!response.ok) {
                const { message } = await response.json().catch(() => ({}));
                throw new Error(message ?? "Failed to create insurer");
            }

            toast({
                title: "Success",
                description: "Insurer created successfully",
            });

            form.reset();
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create insurer",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            ac.abort();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-500" />
                        Add New Insurer
                    </DialogTitle>
                    <DialogDescription>
                        Add a new insurer to the system. Fill in the required information below.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-blue-500" />
                                        Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter insurer name"
                                            {...field}
                                            className="h-9"
                                        />
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
                                    <FormLabel className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-indigo-500" />
                                        Email
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="Enter insurer email"
                                            {...field}
                                            value={field.value || ""}
                                            className="h-9"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-green-500" />
                                        Phone
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            placeholder="Enter insurer phone"
                                            {...field}
                                            value={field.value || ""}
                                            className="h-9"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-purple-500" />
                                        Address
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter insurer address"
                                            {...field}
                                            value={field.value || ""}
                                            className="h-9"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Insurer
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 