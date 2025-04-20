"use client";

import { useEffect, useState, useCallback } from "react";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { CustomerDetail } from "./components/customer-detail";
import { CreateCustomerForm } from "./components/create-client-form";

interface Customer {
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  // Use useCallback to create a stable reference
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/customers");
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="p-6 space-y-6">
      {loading && customers.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto">
          <div className="flex-1 min-w-0">
            <DataTable
              columns={columns}
              data={customers}
              searchKey="name"
              actionButton={
                <CreateCustomerForm onCustomerCreated={fetchCustomers} />
              }
              onRowClick={(customer) => setSelectedCustomer(customer)}
              fetchData={fetchCustomers}
            />
          </div>
          <div className="w-[300px] flex-shrink-0">
            <CustomerDetail customer={selectedCustomer || undefined} />
          </div>
        </div>
      )}
    </div>
  );
}
