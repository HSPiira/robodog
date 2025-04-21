"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { ClientDetail } from "./components/client-detail";
import { CreateClientForm } from "./components/create-client-form";

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

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(
    null
  );

  // Create navigation function
  const navigateToClientDetails = useCallback((clientId: string) => {
    router.push(`/clients/${clientId}`);
  }, [router]);

  // Use useCallback to create a stable reference
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/clients");
      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return (
    <div className="p-6 space-y-6">
      {loading && clients.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto">
          <div className="flex-1 min-w-0">
            <DataTable
              columns={columns}
              data={clients}
              searchKey="name"
              actionButton={
                <CreateClientForm onClientCreated={fetchClients} />
              }
              onRowClick={(client) => setSelectedClient(client)}
              fetchData={fetchClients}
              navigateOnDoubleClick={true}
              navigateToClientDetails={navigateToClientDetails}
            />
          </div>
          <div className="w-[300px] flex-shrink-0">
            <ClientDetail client={selectedClient || undefined} />
          </div>
        </div>
      )}
    </div>
  );
}
