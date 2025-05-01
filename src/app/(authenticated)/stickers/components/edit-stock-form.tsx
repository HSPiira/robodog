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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Pencil, Calendar, Building2, Tag } from "lucide-react";
import { toast } from "sonner";
import { type StickerStockWithRelations } from "./stock-columns";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface EditStockFormProps {
    stock: StickerStockWithRelations;
    onStockUpdated: () => void;
    trigger?: React.ReactNode;
}

const formSchema = z.object({
    serialNumber: z.string().min(1, "Serial number is required"),
    receivedAt: z.date({
        required_error: "Received date is required",
    }),
    insurerId: z.string().min(1, "Insurer is required"),
    stickerTypeId: z.string().min(1, "Sticker type is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function EditStockForm({
    stock,
    onStockUpdated,
    trigger,
}: EditStockFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [insurers, setInsurers] = useState<{ id: string; name: string }[]>([]);
    const [stickerTypes, setStickerTypes] = useState<{ id: string; name: string }[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            serialNumber: stock.serialNumber,
            receivedAt: new Date(stock.receivedAt),
            insurerId: stock.insurerId,
            stickerTypeId: stock.stickerTypeId,
        },
    });

    // Fetch insurers and sticker types when the dialog opens
    const fetchData = async () => {
        try {
            const [insurersRes, stickerTypesRes] = await Promise.all([
                fetch("/api/insurers"),
                fetch("/api/sticker-types"),
            ]);

            if (!insurersRes.ok || !stickerTypesRes.ok) {
                throw new Error("Failed to fetch data");
            }

            const [insurersData, stickerTypesData] = await Promise.all([
                insurersRes.json(),
                stickerTypesRes.json(),
            ]);

            setInsurers(insurersData);
            setStickerTypes(stickerTypesData);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to fetch required data");
        }
    };

    const onSubmit = async (data: FormValues) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/stickers/stock/${stock.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to update stock");
            }

            toast.success("Stock updated successfully");
            onStockUpdated();
            setOpen(false);
        } catch (error) {
            console.error("Error updating stock:", error);
            toast.error("Failed to update stock");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => {
            setOpen(open);
            if (open) {
                fetchData();
            }
        }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-2"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Stock
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Stock</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="serialNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                        <Tag className="h-3.5 w-3.5 text-purple-500" />
                                        Serial Number
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter serial number" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="receivedAt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-orange-500" />
                                        Received Date
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full h-8 px-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start" side="bottom">
                                            <CalendarComponent
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                                className="rounded-md border shadow"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="insurerId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                        <Building2 className="h-3.5 w-3.5 text-emerald-500" />
                                        Insurer
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select insurer" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {insurers.map((insurer) => (
                                                <SelectItem key={insurer.id} value={insurer.id}>
                                                    {insurer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="stickerTypeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1.5">
                                        <Tag className="h-3.5 w-3.5 text-purple-500" />
                                        Sticker Type
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select sticker type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {stickerTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 