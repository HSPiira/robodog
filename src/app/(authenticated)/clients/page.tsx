"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { ClientDetail } from "./components/client-detail";
import { CreateClientForm } from "./components/create-client-form";
import { useAuth } from "@/lib/context/auth-context";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: "INDIVIDUAL" | "BUSINESS" | "GOVERNMENT" | "NON_PROFIT";
  status: "active" | "inactive";
  policies: number;
  joinedDate: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export default function ClientsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Create navigation function
  const navigateToClientDetails = useCallback((clientId: string) => {
    router.push(`/clients/${clientId}`);
  }, [router]);

  // Use useCallback to create a stable reference
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/clients", {
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }
      const result = await response.json();

      // API now returns data wrapped in a 'data' field with pagination
      if (result.data) {
        setClients(result.data);
      } else {
        // Fallback for older API format or if data structure changes
        setClients(result);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Handle client selection with toggle behavior
  const handleClientSelect = (client: Client) => {
    if (selectedClient?.id === client.id) {
      // If clicking the same client, toggle the details panel
      setShowDetails(prev => !prev);
    } else {
      // If selecting a different client, show it and open the panel
      setSelectedClient(client);
      setShowDetails(true);
    }
  };

  // Animation classes for the detail panel
  const detailPanelClasses = showDetails && selectedClient
    ? "w-[320px] opacity-100 visible"
    : "w-0 opacity-0 invisible";

  return (
    <div className="p-6 space-y-6">
      {loading && clients.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="flex flex-wrap md:flex-nowrap gap-6 w-full overflow-hidden">
          <div className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${showDetails ? 'w-[calc(100%-352px)]' : 'w-full'}`}>
            <DataTable
              columns={columns}
              data={clients}
              searchKey="name"
              actionButton={
                <CreateClientForm onClientCreated={fetchClients} />
              }
              onRowClick={handleClientSelect}
              fetchData={fetchClients}
              navigateOnDoubleClick={true}
              navigateToClientDetails={navigateToClientDetails}
              selectedRow={selectedClient}
              showDetails={showDetails}
            />
          </div>
          <div className={`flex-shrink-0 transition-all duration-300 ease-in-out ${detailPanelClasses}`}>
            {selectedClient && (
              <ClientDetail
                client={selectedClient}
                onRefresh={fetchClients}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
