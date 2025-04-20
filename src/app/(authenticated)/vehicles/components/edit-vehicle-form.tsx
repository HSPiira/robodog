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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the form schema
const formSchema = z.object({
    registrationNo: z.string()
        .min(1, "Registration number is required")
        .transform(val => val.trim().toUpperCase())
        .refine(val => val.length >= 1, {
            message: "Registration number is required"
        }),
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.coerce.number()
        .int("Year must be a whole number")
        .min(1900, "Year must be after 1900")
        .max(new Date().getFullYear() + 1, `Year cannot be later than ${new Date().getFullYear() + 1}`),
    bodyTypeId: z.string().min(1, "Body type is required"),
    categoryId: z.string().min(1, "Vehicle category is required"),
    vehicleTypeId: z.string().min(1, "Vehicle type is required"),
    customerId: z.string().min(1, "Owner is required"),
    chassisNo: z.string().min(1, "Chassis number is required"),
    engineNo: z.string().min(1, "Engine number is required"),
    seatingCapacity: z.coerce.number().int().positive().optional(),
    cubicCapacity: z.coerce.number().int().positive().optional(),
    grossWeight: z.coerce.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface VehicleType {
    id: string;
    name: string;
}

interface BodyType {
    id: string;
    name: string;
}

interface VehicleCategory {
    id: string;
    name: string;
}

interface Customer {
    id: string;
    name: string;
}

interface EditVehicleFormProps {
    vehicleId: string;
    trigger?: React.ReactNode;
    onVehicleUpdated: () => void;
}

export function EditVehicleForm({ vehicleId, trigger, onVehicleUpdated }: EditVehicleFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
    const [bodyTypes, setBodyTypes] = useState<BodyType[]>([]);
    const [vehicleCategories, setVehicleCategories] = useState<VehicleCategory[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            registrationNo: "",
            make: "",
            model: "",
            year: new Date().getFullYear(),
            bodyTypeId: "",
            categoryId: "",
            vehicleTypeId: "",
            customerId: "",
            chassisNo: "",
            engineNo: "",
            seatingCapacity: undefined,
            cubicCapacity: undefined,
            grossWeight: undefined,
        },
    });

    // Fetch vehicle data when the dialog is opened
    useEffect(() => {
        if (open && vehicleId) {
            const fetchVehicleData = async () => {
                setIsFetching(true);
                try {
                    // Fetch reference data
                    const [vehicleResponse, typesResponse, bodyResponse, categoryResponse, customerResponse] = await Promise.all([
                        fetch(`/api/vehicles/${vehicleId}`),
                        fetch('/api/vehicle-types'),
                        fetch('/api/body-types'),
                        fetch('/api/vehicle-categories'),
                        fetch('/api/customers')
                    ]);

                    if (!vehicleResponse.ok) {
                        throw new Error("Failed to fetch vehicle");
                    }

                    // Load reference data
                    const typesData = await typesResponse.json();
                    setVehicleTypes(typesData);

                    const bodyData = await bodyResponse.json();
                    setBodyTypes(bodyData);

                    const categoryData = await categoryResponse.json();
                    setVehicleCategories(categoryData);

                    const customerData = await customerResponse.json();
                    setCustomers(customerData);

                    // Load vehicle data
                    const vehicleData = await vehicleResponse.json();

                    // Update form with vehicle data
                    form.reset({
                        registrationNo: vehicleData.registrationNo,
                        make: vehicleData.make,
                        model: vehicleData.model,
                        year: vehicleData.year,
                        bodyTypeId: vehicleData.bodyTypeId,
                        categoryId: vehicleData.categoryId,
                        vehicleTypeId: vehicleData.vehicleTypeId,
                        customerId: vehicleData.customerId,
                        chassisNo: vehicleData.chassisNo,
                        engineNo: vehicleData.engineNo,
                        seatingCapacity: vehicleData.seatingCapacity || undefined,
                        cubicCapacity: vehicleData.cubicCapacity || undefined,
                        grossWeight: vehicleData.grossWeight || undefined,
                    });
                } catch (error) {
                    console.error("Error fetching vehicle data:", error);
                    toast.error("Failed to load vehicle information");
                    setOpen(false);
                } finally {
                    setIsFetching(false);
                    setIsLoadingOptions(false);
                }
            };

            fetchVehicleData();
        }
    }, [open, vehicleId, form]);

    const onSubmit = async (data: FormValues) => {
        try {
            setIsLoading(true);

            const response = await fetch(`/api/vehicles/${vehicleId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("Failed to update vehicle");
            }

            toast.success("Vehicle updated successfully");
            setOpen(false);
            onVehicleUpdated();
        } catch (error) {
            console.error("Error updating vehicle:", error);
            toast.error("Failed to update vehicle");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild onClick={(e) => e.preventDefault()}>
                {trigger || (
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader className="pb-4 border-b">
                    <DialogTitle className="text-xl font-semibold tracking-tight">
                        Edit Vehicle
                    </DialogTitle>
                </DialogHeader>
                {isFetching || isLoadingOptions ? (
                    <div className="py-8 flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
                            <Tabs defaultValue="basic" className="w-full">
                                <TabsList className="grid grid-cols-2 w-full">
                                    <TabsTrigger value="basic">Basic Information</TabsTrigger>
                                    <TabsTrigger value="technical">Technical Details</TabsTrigger>
                                </TabsList>

                                <TabsContent value="basic" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="registrationNo"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Registration No. *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="UBB 000A"
                                                            disabled={isLoading}
                                                            className="uppercase"
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="year"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Year *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            placeholder="2023"
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="make"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Make *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Toyota"
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="model"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Model *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Corolla"
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="vehicleTypeId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Vehicle Type *</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={isLoading}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select vehicle type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {vehicleTypes.map((type) => (
                                                                <SelectItem key={type.id} value={type.id}>
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
                                            name="categoryId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Category *</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={isLoading}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select category" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {vehicleCategories.map((category) => (
                                                                <SelectItem key={category.id} value={category.id}>
                                                                    {category.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="bodyTypeId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">Body Type *</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    disabled={isLoading}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select body type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {bodyTypes.map((type) => (
                                                            <SelectItem key={type.id} value={type.id}>
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
                                        name="customerId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium">Owner *</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    disabled={isLoading}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select vehicle owner" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {customers.map((customer) => (
                                                            <SelectItem key={customer.id} value={customer.id}>
                                                                {customer.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>

                                <TabsContent value="technical" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="chassisNo"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Chassis No. *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="JTDZS3EU0E3298500"
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="engineNo"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Engine No. *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="2ZR-3298500"
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="seatingCapacity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Seating</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            placeholder="5"
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="cubicCapacity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Engine Capacity (cc)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            placeholder="1800"
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="grossWeight"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Weight (kg)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            type="number"
                                                            placeholder="1500"
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Vehicle
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
} 