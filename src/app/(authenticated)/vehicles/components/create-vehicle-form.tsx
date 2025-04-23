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
  Plus,
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
  Ruler,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parse } from "@/lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VehicleType as DbVehicleType } from "@prisma/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// Define the form schema
const formSchema = z.object({
  registrationNo: z
    .string()
    .min(1, "Registration number is required")
    .transform((val) => val.trim().toUpperCase())
    .refine((val) => val.length >= 1, {
      message: "Registration number is required",
    }),
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

interface BodyType {
  id: string;
  name: string;
}

interface VehicleCategory {
  id: string;
  name: string;
}

interface VehicleTypeData {
  id: string;
  name: string;
  description?: string;
}

interface Client {
  id: string;
  name: string;
}

interface CreateVehicleFormProps {
  onVehicleCreated: () => void;
  clientId?: string;
  isCompact?: boolean;
}

export function CreateVehicleForm({
  onVehicleCreated,
  clientId,
  isCompact = false,
}: CreateVehicleFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bodyTypes, setBodyTypes] = useState<BodyType[]>([]);
  const [vehicleCategories, setVehicleCategories] = useState<VehicleCategory[]>(
    []
  );
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeData[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

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
      clientId: clientId || "",
      chassisNumber: "",
      engineNumber: "",
      seatingCapacity: undefined,
      cubicCapacity: undefined,
      grossWeight: undefined,
    },
  });

  // Fetch reference data when the dialog is opened
  useEffect(() => {
    if (open) {
      const fetchReferenceData = async () => {
        setIsLoadingOptions(true);
        try {
          // Fetch all reference data in parallel
          const [
            bodyResponse,
            categoryResponse,
            vehicleTypeResponse,
            clientResponse,
          ] = await Promise.all([
            fetch("/api/body-types"),
            fetch("/api/vehicle-categories"),
            fetch("/api/vehicle-types"),
            !clientId ? fetch("/api/clients") : Promise.resolve(null),
          ]);

          const [bodyData, categoryData, vehicleTypeData] = await Promise.all([
            parse(bodyResponse),
            parse(categoryResponse),
            parse(vehicleTypeResponse),
          ]);

          setBodyTypes(bodyData);
          setVehicleCategories(categoryData);
          setVehicleTypes(vehicleTypeData);

          // Only fetch clients if clientId is not provided
          if (!clientId && clientResponse) {
            const clientData = await parse(clientResponse);
            setClients(
              Array.isArray(clientData) ? clientData : clientData?.data || []
            );
          }
        } catch (error) {
          console.error("Error fetching reference data:", error);
          toast.error("Failed to load reference data");
        } finally {
          setIsLoadingOptions(false);
        }
      };

      fetchReferenceData();
    }
  }, [open, clientId]);

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create vehicle");
      }

      toast.success("Vehicle created successfully");
      setOpen(false);
      form.reset();
      onVehicleCreated();
    } catch (error) {
      console.error("Error creating vehicle:", error);
      toast.error("Failed to create vehicle");
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
        {isCompact ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1 text-blue-500" />
            Add Vehicle
          </Button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors"
                  onClick={() => setOpen(true)}
                >
                  <CarFront className="h-4 w-4 text-blue-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Add new vehicle
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <CarFront className="h-5 w-5 text-blue-500" />
            Add New Vehicle
          </DialogTitle>
        </DialogHeader>
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
                <TabsTrigger value="basic" className="flex items-center gap-2">
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
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? vehicleTypes.find(
                                      (type) => type.id === field.value
                                    )?.name
                                    : "Select vehicle type"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command className="w-full">
                                <CommandInput
                                  placeholder="Search types..."
                                  className="h-9"
                                />
                                <div className="max-h-[200px] overflow-y-auto">
                                  <CommandEmpty>No type found.</CommandEmpty>
                                  <CommandGroup>
                                    {vehicleTypes.map((type) => (
                                      <CommandItem
                                        key={type.id}
                                        value={type.name}
                                        onSelect={() => {
                                          form.setValue("vehicleTypeId", type.id);
                                        }}
                                        className="flex items-center gap-2 text-sm py-2"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4 flex-shrink-0",
                                            type.id === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        <span className="truncate">
                                          {type.name}
                                          {type.description && (
                                            <span className="text-muted-foreground">
                                              {" "}
                                              {type.description.length > 50
                                                ? type.description.substring(
                                                  0,
                                                  50
                                                ) + "..."
                                                : type.description}
                                            </span>
                                          )}
                                        </span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </div>
                              </Command>
                            </PopoverContent>
                          </Popover>
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
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? vehicleCategories.find(
                                      (category) =>
                                        category.id === field.value
                                    )?.name
                                    : "Select category"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command className="w-full">
                                <CommandInput
                                  placeholder="Search categories..."
                                  className="h-9"
                                />
                                <div className="max-h-[200px] overflow-y-auto">
                                  <CommandEmpty>No category found.</CommandEmpty>
                                  <CommandGroup>
                                    {vehicleCategories.map((category) => (
                                      <CommandItem
                                        key={category.id}
                                        value={category.name}
                                        onSelect={() => {
                                          form.setValue(
                                            "categoryId",
                                            category.id
                                          );
                                        }}
                                        className="flex items-center gap-2 text-sm py-2"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4 flex-shrink-0",
                                            category.id === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {category.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </div>
                              </Command>
                            </PopoverContent>
                          </Popover>
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
                        <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                          <CarFront className="h-3.5 w-3.5 text-cyan-500" />
                          Body Type *
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? bodyTypes.find(
                                    (type) => type.id === field.value
                                  )?.name
                                  : "Select body type"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command className="w-full">
                              <CommandInput
                                placeholder="Search body types..."
                                className="h-9"
                              />
                              <div className="max-h-[200px] overflow-y-auto">
                                <CommandEmpty>No body type found.</CommandEmpty>
                                <CommandGroup>
                                  {bodyTypes.map((type) => (
                                    <CommandItem
                                      key={type.id}
                                      value={type.name}
                                      onSelect={() => {
                                        form.setValue("bodyTypeId", type.id);
                                      }}
                                      className="flex items-center gap-2 text-sm py-2"
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4 flex-shrink-0",
                                          type.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {type.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </div>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  {!clientId && (
                    <FormField
                      control={form.control}
                      name="clientId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                            <UserCheck className="h-3.5 w-3.5 text-pink-500" />
                            Owner *
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? clients.find(
                                      (client) => client.id === field.value
                                    )?.name
                                    : "Select vehicle owner"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command className="w-full">
                                <CommandInput
                                  placeholder="Search clients..."
                                  className="h-9"
                                />
                                <div className="max-h-[200px] overflow-y-auto">
                                  <CommandEmpty>No client found.</CommandEmpty>
                                  <CommandGroup>
                                    {clients.map((client) => (
                                      <CommandItem
                                        key={client.id}
                                        value={client.name}
                                        onSelect={() => {
                                          form.setValue("clientId", client.id);
                                        }}
                                        className="flex items-center gap-2 text-sm py-2"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4 flex-shrink-0",
                                            client.id === field.value
                                              ? "opacity-100"
                                              : "opacity-0"
                                          )}
                                        />
                                        {client.name}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </div>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  )}
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
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Vehicle
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
