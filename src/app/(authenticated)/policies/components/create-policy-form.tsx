"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
    FormDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon, Loader2, Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Client, Vehicle, Insurer, PolicyStatus } from "@prisma/client";
import { DatePicker } from "@/components/ui/date-picker";

const formSchema = z.object({
    policyNo: z.string().min(1, "Policy number is required"),
    clientId: z.string().min(1, "Client is required"),
    insurerId: z.string().min(1, "Insurer is required"),
    status: z.nativeEnum(PolicyStatus),
    validFrom: z.date({
        required_error: "Valid from date is required",
    }),
    validTo: z.date({
        required_error: "Valid to date is required",
    }),
    premium: z.coerce.number().nullable().optional(),
    stampDuty: z.coerce.number().nullable().optional(),
    remarks: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.validTo <= data.validFrom) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Valid-to date must be after valid-from date",
            path: ["validTo"],
        });
    }
});

interface CreatePolicyFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

// Cache for fetched data
const dataCache = {
    clients: [] as Array<{ id: string; name: string }>,
    vehicles: [] as Array<{ id: string; registrationNo: string; make: string; model: string }>,
    insurers: [] as Array<{ id: string; name: string; code: string }>,
    lastFetched: 0,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

export function CreatePolicyForm({ onSuccess, onCancel }: CreatePolicyFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
    const [vehicles, setVehicles] = useState<Array<{ id: string; registrationNo: string; make: string; model: string }>>([]);
    const [insurers, setInsurers] = useState<Array<{ id: string; name: string; code: string }>>([]);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [clientSearchTerm, setClientSearchTerm] = useState("");
    const [insurerSearchTerm, setInsurerSearchTerm] = useState("");
    const [clientCurrentPage, setClientCurrentPage] = useState(1);
    const [insurerCurrentPage, setInsurerCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: PolicyStatus.PENDING,
            premium: null,
            stampDuty: null,
            validFrom: new Date(),
            validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },
    });

    const fetchData = async () => {
        if (!isOpen) return;

        // Check cache first
        const now = Date.now();
        if (now - dataCache.lastFetched < dataCache.CACHE_DURATION) {
            setClients(dataCache.clients);
            setInsurers(dataCache.insurers);
            return;
        }

        try {
            setIsDataLoading(true);
            const [clientsRes, insurersRes] = await Promise.all([
                fetch("/api/clients?limit=100", { credentials: "include" }),
                fetch("/api/insurers?limit=100", { credentials: "include" }),
            ]);

            if (!clientsRes.ok) {
                const errText = await clientsRes.text().catch(() => "Unknown error");
                throw new Error(`Failed to fetch clients: ${clientsRes.status} ${errText}`);
            }

            if (!insurersRes.ok) {
                const errText = await insurersRes.text().catch(() => "Unknown error");
                throw new Error(`Failed to fetch insurers: ${insurersRes.status} ${errText}`);
            }

            const [clientsData, insurersData] = await Promise.all([
                clientsRes.json(),
                insurersRes.json(),
            ]);

            const clientsList = Array.isArray(clientsData) ? clientsData : clientsData?.data || [];
            const insurersList = Array.isArray(insurersData) ? insurersData : insurersData?.data || [];

            // Update cache
            dataCache.clients = clientsList;
            dataCache.insurers = insurersList;
            dataCache.lastFetched = now;

            setClients(clientsList);
            setInsurers(insurersList);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to load form data",
                variant: "destructive",
            });
        } finally {
            setIsDataLoading(false);
        }
    };

    // Filter and paginate data
    const getFilteredData = (data: any[], searchKey: string, searchTerm: string) => {
        return data.filter(item =>
            item[searchKey].toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const getPaginatedData = (data: any[], currentPage: number) => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return data.slice(start, end);
    };

    // Pre-fetch data when component mounts
    useEffect(() => {
        fetchData();
    }, []);

    // Only re-fetch when dialog opens if data is empty
    useEffect(() => {
        if (isOpen && (clients.length === 0 || insurers.length === 0)) {
            fetchData();
        }
    }, [isOpen]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsLoading(true);
            const response = await fetch("/api/policies", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...values,
                    validFrom: values.validFrom.toISOString(),
                    validTo: values.validTo.toISOString(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || "Failed to create policy");
            }

            toast({
                title: "Success",
                description: "Policy created successfully",
            });
            setIsOpen(false);
            form.reset();
            onSuccess();
        } catch (error) {
            console.error("Error creating policy:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create policy",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="icon" className="h-8 w-8 rounded-full" title="Create Policy">
                    <Plus className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Create New Policy</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="policyNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Policy Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter policy number" {...field} className="h-9" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={PolicyStatus.ACTIVE}>Active</SelectItem>
                                                <SelectItem value={PolicyStatus.PENDING}>Pending</SelectItem>
                                                <SelectItem value={PolicyStatus.EXPIRED}>Expired</SelectItem>
                                                <SelectItem value={PolicyStatus.CANCELLED}>Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="clientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder={isDataLoading ? "Loading clients..." : "Select client"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <div className="p-2">
                                                    <div className="relative">
                                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Search clients..."
                                                            className="pl-8 h-8"
                                                            value={clientSearchTerm}
                                                            onChange={(e) => setClientSearchTerm(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                {isDataLoading ? (
                                                    <div className="flex items-center justify-center p-4">
                                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                    </div>
                                                ) : (
                                                    <>
                                                        {getPaginatedData(getFilteredData(clients, 'name', clientSearchTerm), clientCurrentPage).map((client) => (
                                                            <SelectItem key={client.id} value={client.id}>
                                                                {client.name}
                                                            </SelectItem>
                                                        ))}
                                                        {getFilteredData(clients, 'name', clientSearchTerm).length > ITEMS_PER_PAGE && (
                                                            <div className="flex items-center justify-between p-2 border-t">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setClientCurrentPage(p => Math.max(1, p - 1))}
                                                                    disabled={clientCurrentPage === 1}
                                                                >
                                                                    Previous
                                                                </Button>
                                                                <span className="text-xs text-muted-foreground">
                                                                    Page {clientCurrentPage}
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setClientCurrentPage(p => p + 1)}
                                                                    disabled={getFilteredData(clients, 'name', clientSearchTerm).length <= clientCurrentPage * ITEMS_PER_PAGE}
                                                                >
                                                                    Next
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="insurerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Insurer</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder={isDataLoading ? "Loading insurers..." : "Select insurer"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <div className="p-2">
                                                    <div className="relative">
                                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Search insurers..."
                                                            className="pl-8 h-8"
                                                            value={insurerSearchTerm}
                                                            onChange={(e) => setInsurerSearchTerm(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                {isDataLoading ? (
                                                    <div className="flex items-center justify-center p-4">
                                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                    </div>
                                                ) : (
                                                    <>
                                                        {getPaginatedData(getFilteredData(insurers, 'name', insurerSearchTerm), insurerCurrentPage).map((insurer) => (
                                                            <SelectItem key={insurer.id} value={insurer.id}>
                                                                {insurer.name}
                                                            </SelectItem>
                                                        ))}
                                                        {getFilteredData(insurers, 'name', insurerSearchTerm).length > ITEMS_PER_PAGE && (
                                                            <div className="flex items-center justify-between p-2 border-t">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setInsurerCurrentPage(p => Math.max(1, p - 1))}
                                                                    disabled={insurerCurrentPage === 1}
                                                                >
                                                                    Previous
                                                                </Button>
                                                                <span className="text-xs text-muted-foreground">
                                                                    Page {insurerCurrentPage}
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setInsurerCurrentPage(p => p + 1)}
                                                                    disabled={getFilteredData(insurers, 'name', insurerSearchTerm).length <= insurerCurrentPage * ITEMS_PER_PAGE}
                                                                >
                                                                    Next
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="validFrom"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Valid From</FormLabel>
                                        <DatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Pick a date"
                                            disabled={isLoading}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="validTo"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Valid To</FormLabel>
                                        <DatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Pick a date"
                                            disabled={isLoading}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="premium"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Premium</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Enter premium amount"
                                                className="h-9"
                                                {...field}
                                                value={field.value === null ? '' : field.value}
                                                onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="stampDuty"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stamp Duty</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Enter stamp duty amount"
                                                className="h-9"
                                                {...field}
                                                value={field.value === null ? '' : field.value}
                                                onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="remarks"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Remarks</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter any remarks"
                                            className="resize-none h-20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsOpen(false);
                                    onCancel();
                                }}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading || isDataLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Policy"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 