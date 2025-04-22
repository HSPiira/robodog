"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Phone,
  Mail,
  User,
  Clock,
  PenTool,
  Shield,
  Info,
  ArrowLeft,
  Edit,
  Car,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DataTable } from "../components/data-table";
import { columns } from "../../vehicles/components/columns";
import { CreateVehicleForm } from "../../vehicles/components/create-vehicle-form";
import { EditClientForm } from "../components/edit-client-form";
import { useAuth } from "@/lib/context/auth-context";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "INDIVIDUAL" | "BUSINESS" | "GOVERNMENT" | "NON_PROFIT";
  status: "active" | "inactive";
  policies: number;
  joinedDate: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

interface Vehicle {
  id: string;
  registrationNo: string;
  make: string;
  model: string;
  year: number;
  chassisNumber: string;
  engineNumber: string;
  bodyType: {
    name: string;
  };
  vehicleCategory: {
    name: string;
  };
  vehicleType: {
    name: string;
  };
  client: {
    id: string;
    name: string;
  };
  isActive: boolean;
  policies: number;
}

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { token } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingClient, setLoadingClient] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  // Fetch client data
  const fetchClient = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoadingClient(true);
      const response = await fetch(`/api/clients/${clientId}`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch client");
      }
      const data = await response.json();
      setClient(data);
    } catch (error) {
      console.error("Error fetching client:", error);
      toast.error("Failed to load client details");
    } finally {
      setLoadingClient(false);
    }
  }, [clientId, token]);

  // Fetch vehicles for this client
  const fetchVehicles = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoadingVehicles(true);
      const response = await fetch(`/api/clients/${clientId}/vehicles`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch vehicles");
      }
      const data = await response.json();
      // Ensure we always have an array
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
      toast.error("Failed to load vehicles");
    } finally {
      setLoadingVehicles(false);
    }
  }, [clientId, token]);

  useEffect(() => {
    fetchClient();
    fetchVehicles();
  }, [fetchClient, fetchVehicles]);

  // Handle client update
  const handleClientUpdated = () => {
    fetchClient();
  };

  // Get color based on client type
  const getTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "INDIVIDUAL":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
      case "BUSINESS":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300";
      case "GOVERNMENT":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300";
      case "NON_PROFIT":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
  };

  // Go back to clients list
  const handleGoBack = () => {
    router.push("/clients");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with back button and edit option */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">
            {loadingClient ? "Loading..." : client?.name || "Client Details"}
          </h1>
          {client && (
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs px-2 py-0.5 h-5",
                  getStatusColor(client.status)
                )}
              >
                {client.status}
              </Badge>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs px-2 py-0.5 h-5",
                  getTypeColor(client.type)
                )}
              >
                {client.type.toLowerCase().replace("_", " ")}
              </Badge>
            </div>
          )}
        </div>
        {client && (
          <EditClientForm
            clientId={client.id}
            onClientUpdated={handleClientUpdated}
          />
        )}
      </div>

      {loadingClient ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : client ? (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vehicles">
              Vehicles ({vehicles.length})
            </TabsTrigger>
            <TabsTrigger value="policies">
              Policies ({client.policies})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium">
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                      <span className="font-medium">Email:</span>
                      <span className="truncate">{client.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                      <span className="font-medium">Phone:</span>
                      <span className="truncate">{client.phone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                      <span className="font-medium">Joined Date:</span>
                      <span className="truncate">
                        {new Date(client.joinedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium">
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-primary/10 dark:bg-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <h3 className="text-sm font-medium">Policies</h3>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {client.policies}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Active policies
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-blue-600/10 dark:bg-blue-600/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Car className="h-5 w-5 text-blue-600" />
                        <h3 className="text-sm font-medium">Vehicles</h3>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {vehicles.length}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          Registered vehicles
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 -mr-2 px-2"
                          onClick={() =>
                            router.push(`/vehicles?clientId=${client.id}`)
                          }
                        >
                          View All
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audit Information */}
              <Card className="shadow-sm md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium">
                    Audit Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {client.createdBy && (
                    <div className="flex items-center gap-2 text-sm">
                      <PenTool className="h-4 w-4 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                      <span className="font-medium">Created by:</span>
                      <span className="truncate">{client.createdBy}</span>
                    </div>
                  )}
                  {client.updatedBy && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                      <span className="font-medium">Last updated by:</span>
                      <span className="truncate">{client.updatedBy}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="mt-4">
            <div className="bg-white dark:bg-slate-950 rounded-lg border p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium">Client Vehicles</h3>
                <CreateVehicleForm
                  onVehicleCreated={fetchVehicles}
                  clientId={client.id}
                />
              </div>

              {loadingVehicles ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : vehicles.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground border rounded-lg bg-muted/10">
                  <div className="flex flex-col items-center gap-2">
                    <Car className="h-8 w-8 text-muted-foreground/50" />
                    <p>No vehicles found for this client</p>
                    <CreateVehicleForm
                      onVehicleCreated={fetchVehicles}
                      clientId={client.id}
                      isCompact={true}
                    />
                  </div>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={vehicles}
                  searchKey="registrationNo"
                  fetchData={fetchVehicles}
                />
              )}
            </div>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies" className="mt-4">
            <div className="bg-white dark:bg-slate-950 rounded-lg border p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <FileText className="h-10 w-10 text-muted-foreground/50" />
                <h3 className="text-lg font-medium">Policy Management</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Policy details for this client will be available in a future
                  update.
                </p>
                <Button disabled className="mt-2">
                  Coming Soon
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="p-8 text-center text-sm text-muted-foreground border rounded-lg bg-muted/10">
          <div className="flex flex-col items-center gap-2">
            <User className="h-8 w-8 text-muted-foreground/50" />
            <p>Client not found</p>
            <Button variant="outline" size="sm" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
