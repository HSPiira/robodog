"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus, Mail, Phone, Home, Building2, User, Loader2, Shield, Heart } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/context/auth-context";

const formSchema = z.object({
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .transform(val => val.trim())
        .refine(val => val.length >= 2, {
            message: "Name must be at least 2 characters after trimming whitespace"
        }),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z
        .string()
        .regex(/^\+?[0-9]{10,15}$/, {
            message: "Enter a valid phone number (digits only, 10-15 chars).",
        })
        .optional()
        .or(z.literal("")),
    address: z.string().min(5, "Address must be at least 5 characters").optional().or(z.literal("")),
    type: z.enum(["INDIVIDUAL", "BUSINESS", "GOVERNMENT", "NON_PROFIT"]).default("INDIVIDUAL"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateClientFormProps {
    onClientCreated: () => void;
}

export function CreateClientForm({ onClientCreated }: CreateClientFormProps) {
    const [open, setOpen] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const { token } = useAuth();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            type: "INDIVIDUAL",
        },
    });

    const checkDuplicateName = async (name: string) => {
        try {
            if (!name || name.trim().length < 2) {
                return false; // No need to check very short names
            }

            const trimmedName = name.trim();
            setIsChecking(true);
            console.log(`Checking if client name exists: "${trimmedName}"`);

            const response = await fetch(`/api/clients/check-duplicate?name=${encodeURIComponent(trimmedName)}`, {
                headers: {
                    "Authorization": token ? `Bearer ${token}` : "",
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error checking duplicate name:", errorData);
                toast.error("Error checking client name");
                return false;
            }

            const data = await response.json();
            console.log("Duplicate check response:", data);

            // If exists is true, we found a duplicate
            if (data.exists) {
                form.setError("name", {
                    type: "manual",
                    message: `A client with this name already exists: ${data.client.name}`,
                });
                return true; // Return true if duplicate exists
            }

            return false; // Return false if no duplicate
        } catch (error) {
            console.error("Error checking client name:", error);
            toast.error("Error checking client name");
            return false;
        } finally {
            setIsChecking(false);
        }
    };

    async function onSubmit(data: FormValues) {
        try {
            const trimmedName = data.name.trim();

            // Check for duplicate name
            const isDuplicate = await checkDuplicateName(trimmedName);
            if (isDuplicate) {
                console.log("Duplicate client name detected, stopping submission");
                return; // Stop form submission if duplicate
            }

            // Clean up empty strings for optional fields
            const payload = {
                ...data,
                name: trimmedName,
                email: data.email?.trim() || undefined,
                phone: data.phone?.trim() || undefined,
                address: data.address?.trim() || undefined,
                type: data.type,
                status: "active"
            };

            console.log("Creating client with data:", payload);

            const response = await fetch("/api/clients", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token ? `Bearer ${token}` : "",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create client");
            }

            // Get the created client data
            const createdClient = await response.json();
            toast.success(`Client "${createdClient.name}" created successfully`);

            form.reset();
            setOpen(false);
            onClientCreated();
        } catch (error) {
            console.error("Error creating client:", error);
            toast.error(error instanceof Error ? error.message : "Failed to create client");
        }
    }

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            // Only allow closing through cancel button or close button
            if (newOpen === false) return;
            setOpen(newOpen);
        }}>
            <DialogTrigger asChild>
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors">
                    <UserPlus className="h-4 w-4 text-blue-500" />
                    <span className="sr-only">Add client</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-500" />
                        Add New Client
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                                        <User className="h-4 w-4 text-blue-500" />
                                        Name *
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="h-10 px-3 bg-background/50 border rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 transition-colors"
                                            placeholder="Enter client name"
                                            disabled={isChecking}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-purple-500" />
                                        Client Type *
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isChecking}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-10 bg-background/50 border rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 transition-colors">
                                                <SelectValue placeholder="Select client type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="INDIVIDUAL">
                                                Individual
                                            </SelectItem>
                                            <SelectItem value="BUSINESS">
                                                Business
                                            </SelectItem>
                                            <SelectItem value="GOVERNMENT">
                                                Government
                                            </SelectItem>
                                            <SelectItem value="NON_PROFIT">
                                                Non-Profit
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-indigo-500" />
                                        Email (optional)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            className="h-10 px-3 bg-background/50 border rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 transition-colors"
                                            placeholder="client@example.com"
                                            disabled={isChecking}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-green-500" />
                                        Phone (optional)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="h-10 px-3 bg-background/50 border rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 transition-colors"
                                            placeholder="+1 (555) 000-0000"
                                            disabled={isChecking}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium flex items-center gap-2">
                                        <Home className="h-4 w-4 text-orange-500" />
                                        Address (optional)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="h-10 px-3 bg-background/50 border rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 transition-colors"
                                            placeholder="Enter address"
                                            disabled={isChecking}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="h-10 px-5 text-sm font-medium rounded-lg hover:bg-background/80 transition-colors"
                                disabled={isChecking}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="h-10 px-5 text-sm font-medium rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors flex items-center gap-2"
                                disabled={isChecking}
                            >
                                {isChecking ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4" />
                                        Create Client
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 