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
import { Pencil, User, Mail, Phone, Building2, ToggleRight, Loader2, Home } from "lucide-react";
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
    address: z.string().min(5, "Address must be at least 5 characters").optional().or(z.literal("")),
    type: z.enum(["INDIVIDUAL", "BUSINESS", "GOVERNMENT", "NON_PROFIT"]),
    status: z.enum(["active", "inactive"]),
});

type FormValues = z.infer<typeof formSchema>;

interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    type: "INDIVIDUAL" | "BUSINESS" | "GOVERNMENT" | "NON_PROFIT";
    status: "active" | "inactive";
    policies: number;
    joinedDate: string;
}

interface EditClientFormProps {
    clientId: string;
    trigger?: React.ReactNode;
    onClientUpdated: () => void;
}

export function EditClientForm({ clientId, trigger, onClientUpdated }: EditClientFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [client, setClient] = useState<Client | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            address: "",
            type: "INDIVIDUAL",
            status: "active",
        },
    });

    // Fetch client data when the dialog is opened
    useEffect(() => {
        if (open && clientId) {
            const fetchClient = async () => {
                try {
                    setIsLoading(true);
                    const response = await fetch(`/api/clients/${clientId}`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch client");
                    }
                    const data = await response.json();
                    setClient(data);

                    // Set form values
                    form.reset({
                        name: data.name,
                        email: data.email || "",
                        phone: data.phone || "",
                        address: data.address || "",
                        type: data.type,
                        status: data.status,
                    });
                } catch (error) {
                    console.error("Error fetching client:", error);
                    toast.error("Failed to load client data");
                } finally {
                    setIsLoading(false);
                }
            };

            fetchClient();
        }
    }, [open, clientId, form]);

    const onSubmit = async (data: FormValues) => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/clients/${clientId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email || undefined,
                    phone: data.phone || undefined,
                    address: data.address || undefined,
                    type: data.type,
                    status: data.status,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update client");
            }

            toast.success("Client updated successfully");
            setOpen(false);
            onClientUpdated();
        } catch (error) {
            console.error("Error updating client:", error);
            toast.error("Failed to update client");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(newOpen) => {
                // Only allow opening, prevent closing except through buttons
                if (newOpen === false) return;
                setOpen(newOpen);
            }}
        >
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Pencil className="h-4 w-4 text-amber-500" />
                        <span className="sr-only">Edit client</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-500" />
                        Edit Client
                    </DialogTitle>
                </DialogHeader>
                {isLoading && !client ? (
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
                                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                                            <User className="h-4 w-4 text-blue-500" />
                                            Name *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter client name"
                                                disabled={isLoading}
                                                className="h-10 px-3 bg-background/50 border rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 transition-colors"
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
                                            Client Type
                                        </FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-10 bg-background/50 border rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 transition-colors">
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
                                        <FormLabel className="text-sm font-medium flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-indigo-500" />
                                            Email (optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="client@example.com"
                                                disabled={isLoading}
                                                className="h-10 px-3 bg-background/50 border rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 transition-colors"
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
                                                placeholder="+1 (555) 000-0000"
                                                disabled={isLoading}
                                                className="h-10 px-3 bg-background/50 border rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 transition-colors"
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
                                                placeholder="Enter address"
                                                disabled={isLoading}
                                                className="h-10 px-3 bg-background/50 border rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 transition-colors"
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
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background/50 transition-colors">
                                        <div className="space-y-0.5 flex items-center gap-2">
                                            <ToggleRight className="h-4 w-4 text-cyan-500" />
                                            <div>
                                                <FormLabel className="text-sm font-medium">
                                                    Active Status
                                                </FormLabel>
                                                <div className="text-xs text-muted-foreground">
                                                    Client will be marked as {field.value === "active" ? "active" : "inactive"}
                                                </div>
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
                                    className="h-10 px-4 py-2 text-sm font-medium rounded-lg hover:bg-background/80 transition-colors"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="h-10 px-4 py-2 text-sm font-medium rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors flex items-center gap-2"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Pencil className="h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
} 