"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    vehicleId: z.string().min(1, "Vehicle is required"),
    policyId: z.string().optional(),
    stickerTypeId: z.string().min(1, "Sticker type is required"),
    stockId: z.string().min(1, "Sticker stock is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateStickerFormProps {
    trigger?: React.ReactNode;
    onStickerCreated?: () => void;
}

type StockItem = {
    id: string;
    serialNumber: string;
    insurer: {
        name: string;
    };
};

export function CreateStickerForm({ trigger, onStickerCreated }: CreateStickerFormProps) {
    const [open, setOpen] = useState(false);
    const [stockOpen, setStockOpen] = useState(false);
    const [vehicles, setVehicles] = useState<{ id: string; registrationNo: string }[]>([]);
    const [policies, setPolicies] = useState<{ id: string; policyNo: string }[]>([]);
    const [stickerTypes, setStickerTypes] = useState<{ id: string; name: string }[]>([]);
    const [availableStock, setAvailableStock] = useState<StockItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            vehicleId: "",
            policyId: "",
            stickerTypeId: "",
            stockId: "",
        },
    });

    const fetchVehicles = async () => {
        try {
            const response = await fetch("/api/vehicles");
            if (!response.ok) {
                throw new Error("Failed to fetch vehicles");
            }
            const data = await response.json();
            setVehicles(data);
        } catch (error) {
            console.error("Error fetching vehicles:", error);
            toast.error("Failed to fetch vehicles");
        }
    };

    const fetchPolicies = async () => {
        try {
            const response = await fetch("/api/policies");
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

    const fetchStickerTypes = async () => {
        try {
            const response = await fetch("/api/sticker-types");
            if (!response.ok) {
                throw new Error("Failed to fetch sticker types");
            }
            const data = await response.json();
            setStickerTypes(data);
        } catch (error) {
            console.error("Error fetching sticker types:", error);
            toast.error("Failed to fetch sticker types");
        }
    };

    const fetchAvailableStock = async (stickerTypeId: string) => {
        try {
            const response = await fetch(`/api/stickers/stock?stickerTypeId=${stickerTypeId}&status=AVAILABLE&unissued=true`);
            if (!response.ok) {
                throw new Error("Failed to fetch available stock");
            }
            const data = await response.json();
            setAvailableStock(data);
        } catch (error) {
            console.error("Error fetching available stock:", error);
            toast.error("Failed to fetch available stock");
        }
    };

    useEffect(() => {
        if (open) {
            fetchVehicles();
            fetchPolicies();
            fetchStickerTypes();
        }
    }, [open]);

    useEffect(() => {
        const stickerTypeId = form.watch("stickerTypeId");
        if (stickerTypeId) {
            form.setValue("stockId", "");
            fetchAvailableStock(stickerTypeId);
        } else {
            setAvailableStock([]);
        }
    }, [form.watch("stickerTypeId")]);

    const onSubmit = async (values: FormValues) => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/sticker-issuance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error("Failed to create sticker issuance");
            }

            toast.success("Sticker issued successfully");
            setOpen(false);
            onStickerCreated?.();
        } catch (error) {
            console.error("Error creating sticker issuance:", error);
            toast.error("Failed to issue sticker");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full flex-shrink-0 border-blue-500/20 hover:border-blue-500 hover:bg-blue-500/10 text-blue-500"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-lg">Issue Sticker</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <div className="grid gap-4">
                            <FormField
                                control={form.control}
                                name="vehicleId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Vehicle</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={isLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="text-sm">
                                                    <SelectValue placeholder="Select vehicle" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {vehicles.map((vehicle) => (
                                                    <SelectItem key={vehicle.id} value={vehicle.id} className="text-sm">
                                                        {vehicle.registrationNo}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="policyId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Policy (Optional)</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={isLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="text-sm">
                                                    <SelectValue placeholder="Select policy" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {policies.map((policy) => (
                                                    <SelectItem key={policy.id} value={policy.id} className="text-sm">
                                                        {policy.policyNo}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="stickerTypeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Sticker Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={isLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="text-sm">
                                                    <SelectValue placeholder="Select sticker type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {stickerTypes.map((type) => (
                                                    <SelectItem key={type.id} value={type.id} className="text-sm">
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="stockId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-sm">Sticker Stock</FormLabel>
                                        <Popover open={stockOpen} onOpenChange={setStockOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={stockOpen}
                                                        className={cn(
                                                            "w-full justify-between text-sm",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                        disabled={isLoading || !form.watch("stickerTypeId")}
                                                    >
                                                        {field.value ? (
                                                            <div className="flex items-center w-full overflow-hidden">
                                                                <span className="font-medium whitespace-nowrap min-w-[120px] mr-1">
                                                                    {availableStock.find((stock) => stock.id === field.value)?.serialNumber}
                                                                </span>
                                                                <span className="text-muted-foreground truncate text-xs">
                                                                    · {availableStock.find((stock) => stock.id === field.value)?.insurer.name}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            "Select sticker stock"
                                                        )}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent align="start" className="p-0 w-[var(--radix-popover-trigger-width)] max-h-[300px]">
                                                <Command className="text-sm">
                                                    <CommandInput placeholder="Search sticker stock..." className="text-sm" />
                                                    <CommandEmpty className="text-sm">No stock found.</CommandEmpty>
                                                    <CommandGroup className="max-h-[200px] overflow-auto">
                                                        {availableStock.map((stock) => (
                                                            <CommandItem
                                                                key={stock.id}
                                                                value={`${stock.serialNumber} ${stock.insurer.name}`}
                                                                onSelect={() => {
                                                                    form.setValue("stockId", stock.id);
                                                                    setStockOpen(false);
                                                                }}
                                                                className="text-xs py-1"
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-3.5 w-3.5",
                                                                        stock.id === field.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex items-center w-full">
                                                                    <span className="font-medium whitespace-nowrap min-w-[120px] mr-1">
                                                                        {stock.serialNumber}
                                                                    </span>
                                                                    <span className="text-muted-foreground truncate">
                                                                        · {stock.insurer.name}
                                                                    </span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isLoading}
                                className="text-sm"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading} className="text-sm">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Issue Sticker'
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 