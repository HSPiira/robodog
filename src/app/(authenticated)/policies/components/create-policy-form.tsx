"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Client, Vehicle, Insurer, PolicyStatus } from "@prisma/client";

const formSchema = z.object({
    policyNo: z.string().min(1, "Policy number is required"),
    clientId: z.string().min(1, "Client is required"),
    vehicleId: z.string().min(1, "Vehicle is required"),
    insurerId: z.string().min(1, "Insurer is required"),
    status: z.nativeEnum(PolicyStatus),
    validFrom: z.date({
        required_error: "Valid from date is required",
    }),
    validTo: z.date({
        required_error: "Valid to date is required",
    }),
    premium: z.coerce.number().min(0, "Premium must be a positive number"),
    stampDuty: z.coerce.number().min(0, "Stamp duty must be a positive number"),
    remarks: z.string().optional(),
});

interface CreatePolicyFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function CreatePolicyForm({ onSuccess, onCancel }: CreatePolicyFormProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
    const [vehicles, setVehicles] = useState<Array<{ id: string; registrationNo: string; make: string; model: string }>>([]);
    const [insurers, setInsurers] = useState<Array<{ id: string; name: string }>>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: PolicyStatus.ACTIVE,
            premium: 0,
            stampDuty: 0,
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsRes, vehiclesRes, insurersRes] = await Promise.all([
                    fetch("/api/clients", { credentials: "include" }),
                    fetch("/api/vehicles", { credentials: "include" }),
                    fetch("/api/insurers", { credentials: "include" }),
                ]);

                if (!clientsRes.ok || !vehiclesRes.ok || !insurersRes.ok) {
                    throw new Error("Failed to fetch data");
                }

                const [clientsData, vehiclesData, insurersData] = await Promise.all([
                    clientsRes.json(),
                    vehiclesRes.json(),
                    insurersRes.json(),
                ]);

                // Handle both paginated and non-paginated responses
                const clientsList = Array.isArray(clientsData) ? clientsData : clientsData?.data || [];
                const vehiclesList = Array.isArray(vehiclesData) ? vehiclesData : vehiclesData?.data || [];
                const insurersList = Array.isArray(insurersData) ? insurersData : insurersData?.data || [];

                // Validate that we have arrays
                if (!Array.isArray(clientsList)) {
                    console.error("Clients data is not an array:", clientsData);
                    throw new Error("Invalid clients data format");
                }
                if (!Array.isArray(vehiclesList)) {
                    console.error("Vehicles data is not an array:", vehiclesData);
                    throw new Error("Invalid vehicles data format");
                }
                if (!Array.isArray(insurersList)) {
                    console.error("Insurers data is not an array:", insurersData);
                    throw new Error("Invalid insurers data format");
                }

                setClients(clientsList);
                setVehicles(vehiclesList);
                setInsurers(insurersList);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch required data",
                    variant: "destructive",
                });
                // Set empty arrays on error
                setClients([]);
                setVehicles([]);
                setInsurers([]);
            } finally {
                setIsDataLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const response = await fetch("/api/policies", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                throw new Error("Failed to create policy");
            }

            toast({
                title: "Success",
                description: "Policy created successfully",
            });
            onSuccess();
        } catch (error) {
            console.error("Error creating policy:", error);
            toast({
                title: "Error",
                description: "Failed to create policy",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (isDataLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={PolicyStatus.ACTIVE}>Active</SelectItem>
                                        <SelectItem value={PolicyStatus.INACTIVE}>Inactive</SelectItem>
                                        <SelectItem value={PolicyStatus.PENDING}>Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Client</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Select client" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {clients?.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name}
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
                        name="vehicleId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vehicle</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Select vehicle" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {vehicles?.map((vehicle) => (
                                            <SelectItem key={vehicle.id} value={vehicle.id}>
                                                {vehicle.registrationNo} - {vehicle.make} {vehicle.model}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="validFrom"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Valid From</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full h-9 px-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "MMM d, yyyy")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
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
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full h-9 px-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "MMM d, yyyy")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="insurerId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Insurer</FormLabel>
                            <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Select insurer" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {insurers?.map((insurer) => (
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

                <div className="flex justify-end space-x-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="h-9"
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="h-9">
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Policy"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
} 