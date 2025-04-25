"use client";

import { useState, useEffect } from "react";
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
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Building2, Mail, Phone, MapPin, Loader2, Edit2 } from "lucide-react";

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
    isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface Insurer {
    id: string;
    name: string;
    email?: string;
    address?: string;
    phone?: string;
    isActive: boolean;
}

interface EditInsurerDialogProps {
    insurer: Insurer | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditInsurerDialog({
    insurer,
    open,
    onOpenChange,
    onSuccess
}: EditInsurerDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            isActive: true,
        },
    });

    // Update form values when insurer changes
    useEffect(() => {
        if (insurer) {
            form.reset({
                name: insurer.name,
                email: insurer.email || "",
                phone: insurer.phone || "",
                address: insurer.address || "",
                isActive: insurer.isActive,
            });
        }
    }, [insurer, form]);

    const onSubmit = async (data: FormValues) => {
        if (!insurer) return;

        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/insurers/${insurer.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    ...data,
                    email: data.email || null,
                    phone: data.phone || null,
                    address: data.address || null,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update insurer");
            }

            toast({
                title: "Success",
                description: "Insurer updated successfully",
            });

            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update insurer",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-500" />
                        Edit Insurer
                    </DialogTitle>
                    <DialogDescription>
                        Update the insurer information below.
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
                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>Status</FormLabel>
                                        <FormDescription className="text-xs text-muted-foreground">
                                            {field.value ? "Active" : "Inactive"}
                                        </FormDescription>
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
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 