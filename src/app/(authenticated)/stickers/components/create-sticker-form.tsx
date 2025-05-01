"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Check, ChevronsUpDown, Car } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    stickerNo: z.string().min(1, "Sticker number is required"),
    policyId: z.string().min(1, "Policy is required"),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: Partial<FormValues> = {
    stickerNo: "",
    policyId: "",
};

interface Policy {
    id: string;
    policyNo: string;
    client: {
        id: string;
        name: string;
    };
    vehicle: {
        id: string;
        registrationNo: string;
        make?: string;
        model?: string;
    };
    validFrom: string;
    validTo: string;
    status: string;
}

interface CreateStickerFormProps {
    onStickerCreated?: () => void;
    trigger?: React.ReactNode;
}

export function CreateStickerForm({ onStickerCreated, trigger }: CreateStickerFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [policyOpen, setPolicyOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const fetchPolicies = async () => {
        try {
            const response = await fetch("/api/policies?active=true");
            if (!response.ok) {
                throw new Error("Failed to fetch policies");
            }
            const data = await response.json();
            setPolicies(data);
        } catch (error) {
            console.error("Error fetching policies:", error);
            toast.error("Failed to fetch policies");
        }
    };

    useEffect(() => {
        if (open) {
            fetchPolicies();
        }
    }, [open]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/stickers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to create sticker");
            }

            toast.success("Sticker created successfully");
            form.reset();
            setOpen(false);
            onStickerCreated?.();
        } catch (error) {
            console.error("Error creating sticker:", error);
            toast.error(error instanceof Error ? error.message : "Failed to create sticker");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedPolicy = policies.find(
        (policy) => policy.id === form.watch("policyId")
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild onClick={() => setOpen(true)}>
                {trigger || (
                    <Button size="sm">
                        New Sticker
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Sticker</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Create a new sticker and assign it to an active policy.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="stickerNo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sticker Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Enter sticker number"
                                            disabled={isLoading}
                                            className="h-9"
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs">
                                        Enter a unique sticker number
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="policyId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Policy</FormLabel>
                                    <Popover open={policyOpen} onOpenChange={setPolicyOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "h-9 w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                    disabled={isLoading}
                                                >
                                                    {selectedPolicy ? (
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <Car className="h-3.5 w-3.5 text-muted-foreground" />
                                                            <span>{selectedPolicy.policyNo}</span>
                                                            <span className="text-muted-foreground">•</span>
                                                            <span>{selectedPolicy.vehicle.registrationNo}</span>
                                                        </div>
                                                    ) : (
                                                        "Select a policy"
                                                    )}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                            <Command>
                                                <CommandInput
                                                    placeholder="Search policies..."
                                                    className="h-9"
                                                />
                                                <CommandEmpty>No policies found.</CommandEmpty>
                                                <CommandGroup className="max-h-[200px] overflow-auto">
                                                    {policies.map((policy) => (
                                                        <CommandItem
                                                            value={policy.policyNo}
                                                            key={policy.id}
                                                            onSelect={() => {
                                                                form.setValue("policyId", policy.id);
                                                                setPolicyOpen(false);
                                                            }}
                                                            className="text-xs"
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-3.5 w-3.5",
                                                                    policy.id === field.value
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    <span>{policy.policyNo}</span>
                                                                    <span className="text-muted-foreground">•</span>
                                                                    <span>{policy.vehicle.registrationNo}</span>
                                                                </div>
                                                                <span className="text-muted-foreground text-[10px]">
                                                                    {policy.client.name}
                                                                </span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription className="text-xs">
                                        Select an active policy to assign the sticker
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Sticker
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 