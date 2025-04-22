"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Calendar, User, CheckCircle, XCircle, Shield, ExternalLink, Car, Eye, MoreHorizontal, Edit, Copy, Trash2, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditClientForm } from "./edit-client-form";
import { DeleteClientDialog } from "./delete-client-dialog";
import { toast } from "@/components/ui/use-toast";

interface ClientDetailProps {
  client?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string | null;
    status: "active" | "inactive";
    type: "INDIVIDUAL" | "BUSINESS" | "GOVERNMENT" | "NON_PROFIT";
    policies: number;
    joinedDate: string;
    createdBy?: string | null;
    updatedBy?: string | null;
  };
  onRefresh?: () => void;
}

export function ClientDetail({ client, onRefresh }: ClientDetailProps) {
  const router = useRouter();
  const [vehicleCount, setVehicleCount] = useState<number>(0);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState<boolean>(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Get color based on client type
  const getTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "INDIVIDUAL": return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
      case "BUSINESS": return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300";
      case "GOVERNMENT": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300";
      case "NON_PROFIT": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
  };

  // Handle navigation
  const handleViewDetails = () => {
    if (client) {
      router.push(`/clients/${client.id}`);
    }
  };

  const handleViewVehicles = () => {
    if (client) {
      router.push(`/vehicles?clientId=${client.id}`);
    }
  };

  // Copy client ID to clipboard
  const copyClientId = async () => {
    if (client) {
      try {
        await navigator.clipboard.writeText(client.id);
        toast({
          title: "Client ID copied",
          description: "The client ID has been copied to your clipboard."
        });
      } catch {
        toast({
          title: "Copy failed",
          description: "Your browser blocked access to the clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  // Fetch vehicle count
  useEffect(() => {
    const fetchVehicleCount = async () => {
      if (!client) return;

      try {
        setIsLoadingVehicles(true);
        const response = await fetch(`/api/clients/${client.id}/vehicles/count`);
        if (response.ok) {
          const data = await response.json();
          setVehicleCount(data.count);
        }
      } catch (error) {
        console.error("Error fetching vehicle count:", error);
      } finally {
        setIsLoadingVehicles(false);
      }
    };

    fetchVehicleCount();
  }, [client]);

  if (!client) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center p-6 opacity-70">
          <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs">Select a client to view details</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full shadow-sm">
      <CardHeader className="border-b pb-2.5">
        <div className="flex justify-between items-start">
          <div className="space-y-1.5">
            <CardTitle className="text-sm font-medium">{client.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={cn(
                "text-[10px] px-1 py-0 h-4 rounded-sm",
                getStatusColor(client.status)
              )}>
                {client.status}
              </Badge>
              <Badge variant="secondary" className={cn(
                "text-[10px] px-1 py-0 h-4 rounded-sm",
                getTypeColor(client.type)
              )}>
                {client.type.toLowerCase().replace("_", " ")}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleViewDetails}
              title="View Details"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs">Client Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-xs cursor-pointer"
                  onClick={copyClientId}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy client ID
                </DropdownMenuItem>
                <EditClientForm
                  clientId={client.id}
                  trigger={
                    <DropdownMenuItem className="gap-2 text-xs cursor-pointer" onSelect={(e) => e.preventDefault()}>
                      <Edit className="h-3.5 w-3.5" />
                      Edit client
                    </DropdownMenuItem>
                  }
                  onClientUpdated={() => {
                    if (onRefresh) onRefresh();
                  }}
                />
                <DropdownMenuItem
                  className="gap-2 text-xs text-destructive cursor-pointer"
                  onClick={() => setShowDeleteDialog(true)}
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete client
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <DeleteClientDialog
          clientId={client.id}
          clientName={client.name}
          onClientDeleted={() => {
            setShowDeleteDialog(false);
            if (onRefresh) onRefresh();
          }}
        />
      )}

      <CardContent className="p-4">
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-medium text-muted-foreground flex items-center">
              <Mail className="h-3.5 w-3.5 text-primary mr-1.5 flex-shrink-0" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                <span className="text-xs">{client.email || "—"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                <span className="text-xs">{client.phone || "—"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Home className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                <span className="text-xs">{client.address || "—"}</span>
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-medium text-muted-foreground flex items-center">
              <User className="h-3.5 w-3.5 text-primary mr-1.5 flex-shrink-0" />
              Client Details
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">Joined Date</span>
                </div>
                <span className="text-xs">
                  {new Date(client.joinedDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Car className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">Vehicles</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">
                    {isLoadingVehicles ? (
                      <span className="inline-block h-3 w-3 rounded-full border border-blue-500 border-t-transparent animate-spin" />
                    ) : vehicleCount}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleViewVehicles}
                    title="View Vehicles"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Information */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-medium text-muted-foreground flex items-center">
              <Shield className="h-3.5 w-3.5 text-primary mr-1.5 flex-shrink-0" />
              Policy Information
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">Active Policies</span>
                </div>
                <span className="text-xs font-medium">
                  {client.policies}
                </span>
              </div>
            </div>
          </div>

          {/* Record Details */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-medium text-muted-foreground flex items-center">
              <User className="h-3.5 w-3.5 text-primary mr-1.5 flex-shrink-0" />
              Record Details
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">Created By</span>
                </div>
                <span className="text-xs">
                  {client.createdBy || "system"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">Last Updated By</span>
                </div>
                <span className="text-xs">
                  {client.updatedBy || "system"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 