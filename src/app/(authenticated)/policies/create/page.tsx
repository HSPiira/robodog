"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

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
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    policyNo: z.string().min(1, "Policy number is required"),
    clientId: z.string().min(1, "Client is required"),
    vehicleId: z.string().min(1, "Vehicle is required"),
    insurerId: z.string().min(1, "Insurer is required"),
    validFrom: z.date({
        required_error: "Valid from date is required",
    }),
    validTo: z.date({
        required_error: "Valid to date is required",
    }),
    premium: z.number().optional(),
    stampDuty: z.number().optional(),
    remarks: z.string().optional(),
});

type Client = {
    id: string;
    name: string;
};

type Vehicle = {
    id: string;
    registrationNo: string;
    make: string;
    model: string;
};

type Insurer = {
    id: string;
    name: string;
};

export default function CreatePolicyPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [clients, setClients] = useState<Client[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [insurers, setInsurers] = useState<Insurer[]>([]);
    const [loading, setLoading] = useState(true);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            policyNo: "",
            clientId: "",
            vehicleId: "",
            insurerId: "",
            premium: undefined,
            stampDuty: undefined,
            remarks: "",
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsRes, vehiclesRes, insurersRes] = await Promise.all([
                    fetch("/api/clients"),
                    fetch("/api/vehicles"),
                    fetch("/api/insurers"),
                ]);

                if (!clientsRes.ok || !vehiclesRes.ok || !insurersRes.ok) {
                    throw new Error("Failed to fetch data");
                }

                const [clientsData, vehiclesData, insurersData] = await Promise.all([
                    clientsRes.json(),
                    vehiclesRes.json(),
                    insurersRes.json(),
                ]);

                setClients(clientsData);
                setVehicles(vehiclesData);
                setInsurers(insurersData);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch required data",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
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

            router.push("/policies");
        } catch (error) {
            console.error("Error creating policy:", error);
            toast({
                title: "Error",
                description: "Failed to create policy",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Create Policy</h1>
            </div>

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
                                        <Input placeholder="Enter policy number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a client" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {clients.map((client) => (
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
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a vehicle" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {vehicles.map((vehicle) => (
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
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an insurer" />
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
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
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
                                                disabled={(date) =>
                                                    date < new Date() || date < new Date("1900-01-01")
                                                }
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
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
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
                                                disabled={(date) =>
                                                    date < new Date() || date < new Date("1900-01-01")
                                                }
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
                            name="premium"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Premium</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Enter premium amount"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
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
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
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
                                    <Input placeholder="Enter remarks" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Optional notes about the policy
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/policies")}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Create Policy</Button>
                    </div>
                </form>
            </Form>
        </div>
    );
} 