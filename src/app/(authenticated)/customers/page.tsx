"use client";

import { useEffect, useState } from "react";
import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { CustomerDetail } from "./components/customer-detail";

interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: "active" | "inactive";
    policies: number;
    joinedDate: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
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
        };

        fetchCustomers();
    }, []);

    return (
        <div className="p-6 space-y-6">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="flex gap-6">
                    <div className="flex-1">
                        <DataTable
                            columns={columns}
                            data={customers}
                            searchKey="name"
                            actionButton={
                                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full">
                                    <UserPlus className="h-4 w-4" />
                                    <span className="sr-only">Add customer</span>
                                </Button>
                            }
                            onRowClick={(customer) => setSelectedCustomer(customer)}
                        />
                    </div>
                    <CustomerDetail customer={selectedCustomer || undefined} />
                </div>
            )}
        </div>
    );
} 