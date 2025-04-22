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
import {
  Car,
  Loader2,
  CarFront,
  ScrollText,
  Calendar,
  Factory,
  Wrench,
  Tag,
  LayoutGrid,
  UserCheck,
  KeyRound,
  CircuitBoard,
  Users,
  Weight,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parse } from "@/lib/api";

// Define the form schema
const formSchema = z.object({
  registrationNo: z
    .string()
    .min(1, "Registration number is required")
    .transform((val) => val.trim().toUpperCase()),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce
    .number()
    .int("Year must be a whole number")
    .min(1900, "Year must be after 1900")
    .max(
      new Date().getFullYear() + 1,
      `Year cannot be later than ${new Date().getFullYear() + 1}`
    ),
  bodyTypeId: z.string().min(1, "Body type is required"),
  categoryId: z.string().min(1, "Vehicle category is required"),
  vehicleTypeId: z.string().min(1, "Vehicle type is required"),
  clientId: z.string().min(1, "Owner is required"),
  chassisNumber: z.string().min(1, "Chassis number is required"),
  engineNumber: z.string().min(1, "Engine number is required"),
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

interface Client {
  id: string;
  name: string;
}

interface EditVehicleFormProps {
  onVehicleUpdated: () => void;
  vehicleId: string;
  trigger?: React.ReactNode;
}

export function EditVehicleForm({
  onVehicleUpdated,
  vehicleId,
  trigger,
}: EditVehicleFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingVehicle, setIsFetchingVehicle] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [bodyTypes, setBodyTypes] = useState<BodyType[]>([]);
  const [vehicleCategories, setVehicleCategories] = useState<VehicleCategory[]>(
    []
  );
  const [clients, setClients] = useState<Client[]>([]);
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
      clientId: "",
      chassisNumber: "",
      engineNumber: "",
      seatingCapacity: undefined,
      cubicCapacity: undefined,
      grossWeight: undefined,
    },
  });

  // Fetch reference data and vehicle data when the dialog is opened
  useEffect(() => {
    if (open) {
      const fetchReferenceData = async () => {
        setIsLoadingOptions(true);
        try {
          // Fetch reference data (vehicle types, body types, etc.)
          const [
            typesResponse,
            bodyResponse,
            categoryResponse,
            clientResponse,
          ] = await Promise.all([
            fetch("/api/vehicle-types"),
            fetch("/api/body-types"),
            fetch("/api/vehicle-categories"),
            fetch("/api/clients"),
          ]);

          const [typesData, bodyData, categoryData, clientData] =
            await Promise.all([
              parse(typesResponse),
              parse(bodyResponse),
              parse(categoryResponse),
              parse(clientResponse),
            ]);

          setVehicleTypes(typesData);
          setBodyTypes(bodyData);
          setVehicleCategories(categoryData);
          setClients(clientData);
        } catch (error) {
          console.error("Error fetching reference data:", error);
          toast.error("Failed to load form data");
        } finally {
          setIsLoadingOptions(false);
        }
      };

      // Fetch vehicle data
      const fetchVehicleData = async () => {
        setIsFetchingVehicle(true);
        try {
          const response = await fetch(`/api/vehicles/${vehicleId}`);
          const vehicleData = await parse(response);

          if (!response.ok || !vehicleData) {
            throw new Error("Failed to fetch vehicle data");
          }

          // Populate form with vehicle data
          form.reset({
            registrationNo: vehicleData.registrationNo || "",
            make: vehicleData.make || "",
            model: vehicleData.model || "",
            year: vehicleData.year || new Date().getFullYear(),
            bodyTypeId: vehicleData.bodyType?.id || "",
            categoryId: vehicleData.vehicleCategory?.id || "",
            vehicleTypeId: vehicleData.vehicleType?.id || "",
            clientId: vehicleData.client?.id || "",
            chassisNumber: vehicleData.chassisNumber || "",
            engineNumber: vehicleData.engineNumber || "",
            seatingCapacity: vehicleData.seatingCapacity,
            cubicCapacity: vehicleData.cubicCapacity,
            grossWeight: vehicleData.grossWeight,
          });
        } catch (error) {
          console.error("Error fetching vehicle:", error);
          toast.error("Failed to load vehicle data");
          setOpen(false);
        } finally {
          setIsFetchingVehicle(false);
        }
      };

      // Run reference data and vehicle data fetches in parallel
      Promise.all([fetchReferenceData(), fetchVehicleData()]);
    }
  }, [open, vehicleId, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
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
          <Button size="sm" variant="ghost" className="h-8 px-2 text-xs">
            <Pencil className="h-3.5 w-3.5 mr-1 text-amber-500" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Car className="h-5 w-5 text-blue-500" />
            Edit Vehicle
          </DialogTitle>
        </DialogHeader>

        {isFetchingVehicle ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-4 space-y-4 flex-1 overflow-hidden flex flex-col text-xs"
            >
              <Tabs
                defaultValue="basic"
                className="w-full flex-1 overflow-hidden flex flex-col"
              >
                <TabsList className="grid grid-cols-2 w-full text-xs">
                  <TabsTrigger
                    value="basic"
                    className="flex items-center gap-2"
                  >
                    <Car className="h-4 w-4 text-blue-500" />
                    Basic Information
                  </TabsTrigger>
                  <TabsTrigger
                    value="technical"
                    className="flex items-center gap-2"
                  >
                    <Wrench className="h-4 w-4 text-purple-500" />
                    Technical Details
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-auto">
                  <TabsContent
                    value="basic"
                    className="space-y-4 mt-4 pb-4 h-[460px] overflow-y-auto pr-1"
                  >
                    {isLoadingOptions && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="registrationNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                              <ScrollText className="h-3.5 w-3.5 text-amber-500" />
                              Registration No. *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="UBB 000A"
                                disabled={isLoading}
                                className="uppercase h-8 focus-visible:ring-1 focus-visible:ring-primary transition-colors"
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
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-green-500" />
                              Year *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="2023"
                                disabled={isLoading}
                                className="h-8 focus-visible:ring-1 focus-visible:ring-primary transition-colors"
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
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                              <Factory className="h-3.5 w-3.5 text-indigo-500" />
                              Make *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Toyota"
                                disabled={isLoading}
                                className="h-8 focus-visible:ring-1 focus-visible:ring-primary transition-colors"
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
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                              <Car className="h-3.5 w-3.5 text-blue-500" />
                              Model *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Corolla"
                                disabled={isLoading}
                                className="h-8 focus-visible:ring-1 focus-visible:ring-primary transition-colors"
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
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                              <LayoutGrid className="h-3.5 w-3.5 text-purple-500" />
                              Vehicle Type *
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isLoading}
                            >
                              <FormControl>
                                <SelectTrigger className="h-8 focus-visible:ring-1 focus-visible:ring-primary transition-colors">
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
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                              <Tag className="h-3.5 w-3.5 text-orange-500" />
                              Category *
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isLoading}
                            >
                              <FormControl>
                                <SelectTrigger className="h-8 focus-visible:ring-1 focus-visible:ring-primary transition-colors">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {vehicleCategories.map((category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id}
                                  >
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

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bodyTypeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                              <CarFront className="h-3.5 w-3.5 text-cyan-500" />
                              Body Type *
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isLoading}
                            >
                              <FormControl>
                                <SelectTrigger className="h-8 focus-visible:ring-1 focus-visible:ring-primary transition-colors">
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
                        name="clientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                              <UserCheck className="h-3.5 w-3.5 text-pink-500" />
                              Owner *
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isLoading}
                            >
                              <FormControl>
                                <SelectTrigger className="h-8 focus-visible:ring-1 focus-visible:ring-primary transition-colors">
                                  <SelectValue placeholder="Select vehicle owner" />
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
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="technical"
                    className="space-y-4 mt-4 pb-4 h-[460px] overflow-y-auto pr-1"
                  >
                    {isLoadingOptions && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/70" />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="chassisNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                              <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                              Chassis No. *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="JTDZS3EU0E3298500"
                                disabled={isLoading}
                                className="h-8 focus-visible:ring-1 focus-visible:ring-primary transition-colors"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="engineNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                              <CircuitBoard className="h-3.5 w-3.5 text-red-500" />
                              Engine No. *
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="2ZR-3298500"
                                disabled={isLoading}
                                className="h-8 focus-visible:ring-1 focus-visible:ring-primary transition-colors"
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
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5 text-indigo-500" />
                              Seating
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="5"
                                disabled={isLoading}
                                className="h-8 focus-visible:ring-1 focus-visible:ring-primary transition-colors"
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
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                              <CircuitBoard className="h-3.5 w-3.5 text-teal-500" />
                              Engine Capacity
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="1800"
                                disabled={isLoading}
                                className="h-8 focus-visible:ring-1 focus-visible:ring-primary transition-colors"
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
                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                              <Weight className="h-3.5 w-3.5 text-orange-500" />
                              Weight (kg)
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="1500"
                                disabled={isLoading}
                                className="h-8 focus-visible:ring-1 focus-visible:ring-primary transition-colors"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              <div className="flex justify-end gap-3 pt-4 border-t mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                  className="hover:bg-background/80 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
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
