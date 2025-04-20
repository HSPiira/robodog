"use client";

import { useState, useEffect } from "react";
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
import {
    Switch,
} from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

// Define the form schema
const formSchema = z.object({
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .transform(val => val.trim())
        .refine(val => val.length >= 2, {
            message: "Name must be at least 2 characters after trimming whitespace"
        }),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().min(10, "Phone number must be at least 10 characters").optional().or(z.literal("")),
    type: z.enum(["INDIVIDUAL", "BUSINESS", "GOVERNMENT", "NON_PROFIT"]),
    status: z.enum(["active", "inactive"]),
});

type FormValues = z.infer<typeof formSchema>;

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: "INDIVIDUAL" | "BUSINESS" | "GOVERNMENT" | "NON_PROFIT";
    status: "active" | "inactive";
    policies: number;
    joinedDate: string;
}

interface EditClientFormProps {
    customerId: string;
    trigger?: React.ReactNode;
    onClientUpdated: () => void;
}

export function EditClientForm({ customerId, trigger, onClientUpdated }: EditClientFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [customer, setCustomer] = useState<Customer | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            type: "INDIVIDUAL",
            status: "active",
        },
    });

    // Fetch customer data when the dialog is opened
    useEffect(() => {
        if (open && customerId) {
            const fetchCustomer = async () => {
                try {
                    setIsLoading(true);
                    const response = await fetch(`/api/customers/${customerId}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch customer");
                    }
                    const data = await response.json();
                    setCustomer(data);

                    // Set form values
                    form.reset({
                        name: data.name,
                        email: data.email || "",
                        phone: data.phone || "",
                        type: data.type,
                        status: data.status,
                    });
                } catch (error) {
                    console.error("Error fetching customer:", error);
                    toast.error("Failed to load customer data");
                } finally {
                    setIsLoading(false);
                }
            };

            fetchCustomer();
        }
    }, [open, customerId, form]);

    const onSubmit = async (data: FormValues) => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/customers/${customerId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email || undefined,
                    phone: data.phone || undefined,
                    type: data.type,
                    status: data.status,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update customer");
            }

            toast.success("Customer updated successfully");
            setOpen(false);
            onClientUpdated();
        } catch (error) {
            console.error("Error updating customer:", error);
            toast.error("Failed to update customer");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit customer</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-xl font-semibold tracking-tight">
                        Edit Customer
                    </DialogTitle>
                </DialogHeader>
                {isLoading && !customer ? (
                    <div className="py-8 flex justify-center">
                        <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
                    </div>
                ) : (
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
                                                placeholder="Enter customer name"
                                                disabled={isLoading}
                                                className="focus-visible:ring-0 focus-visible:ring-offset-0"
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
                                        <FormLabel className="text-sm font-medium">Customer Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="focus-visible:ring-0 focus-visible:ring-offset-0">
                                                    <SelectValue placeholder="Select customer type" />
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
                                                placeholder="customer@example.com"
                                                disabled={isLoading}
                                                className="focus-visible:ring-0 focus-visible:ring-offset-0"
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
                                                placeholder="+1 (555) 000-0000"
                                                disabled={isLoading}
                                                className="focus-visible:ring-0 focus-visible:ring-offset-0"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-sm font-medium">
                                                Active Status
                                            </FormLabel>
                                            <div className="text-xs text-muted-foreground">
                                                Customer will be marked as {field.value === "active" ? "active" : "inactive"}
                                            </div>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value === "active"}
                                                onCheckedChange={(checked) => field.onChange(checked ? "active" : "inactive")}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    className="h-10 px-4 py-2 text-sm font-medium rounded-lg"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="h-10 px-4 py-2 text-sm font-medium rounded-lg"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
} 