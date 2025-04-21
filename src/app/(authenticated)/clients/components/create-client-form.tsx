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
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .transform(val => val.trim())
        .refine(val => val.length >= 2, {
            message: "Name must be at least 2 characters after trimming whitespace"
        }),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().min(10, "Phone number must be at least 10 characters").optional().or(z.literal("")),
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
            const response = await fetch(`/api/clients/check-duplicate?name=${encodeURIComponent(name.trim())}`);
            if (!response.ok) {
                throw new Error("Failed to check for duplicate name");
            }
            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error("Error checking duplicate name:", error);
            return false;
        }
    };

    async function onSubmit(data: FormValues) {
        try {
            setIsChecking(true);
            const trimmedName = data.name.trim();

            // Check for duplicate name
            const isDuplicate = await checkDuplicateName(trimmedName);
            if (isDuplicate) {
                form.setError("name", {
                    type: "manual",
                    message: "A client with this name already exists"
                });
                setIsChecking(false);
                return;
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

            const response = await fetch("/api/clients", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to create client");
            }

            toast.success("Client created successfully");
            form.reset();
            setOpen(false);
            onClientCreated();
        } catch (error) {
            console.error("Error creating client:", error);
            toast.error("Failed to create client");
        } finally {
            setIsChecking(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full">
                    <UserPlus className="h-4 w-4" />
                    <span className="sr-only">Add client</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-xl font-semibold tracking-tight">Add New Client</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium">Name *</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="h-10 px-3 bg-background/50 border rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0"
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
                                    <FormLabel className="text-sm font-medium">Client Type *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isChecking}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-10 bg-background/50 border rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0">
                                                <SelectValue placeholder="Select client type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                                            <SelectItem value="BUSINESS">Business</SelectItem>
                                            <SelectItem value="GOVERNMENT">Government</SelectItem>
                                            <SelectItem value="NON_PROFIT">Non-Profit</SelectItem>
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
                                    <FormLabel className="text-sm font-medium">Email (optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="email"
                                            className="h-10 px-3 bg-background/50 border rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0"
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
                                    <FormLabel className="text-sm font-medium">Phone (optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="h-10 px-3 bg-background/50 border rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0"
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
                                    <FormLabel className="text-sm font-medium">Address (optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            className="h-10 px-3 bg-background/50 border rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0"
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
                                className="h-10 px-5 text-sm font-medium rounded-lg"
                                disabled={isChecking}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="h-10 px-5 text-sm font-medium rounded-lg"
                                disabled={isChecking}
                            >
                                {isChecking ? "Checking..." : "Create Client"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 