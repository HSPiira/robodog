"use client";

import { useEffect, useState, useCallback } from "react";
import { createColumns } from "./components/columns";
import { Policy } from "@prisma/client";
import { DataTable } from "./components/data-table";
import { PolicyDetail } from "./components/policy-detail";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreatePolicyForm } from "./components/create-policy-form";

type PolicyWithRelations = Policy & {
    client: { id: string; name: string };
    insurer: { id: string; name: string };
};

export default function PoliciesPage() {
    const [policies, setPolicies] = useState<PolicyWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPolicy, setSelectedPolicy] = useState<PolicyWithRelations | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    const router = useRouter();

    // Fetch policies data
    const fetchPolicies = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/policies");
            if (!response.ok) {
                throw new Error("Failed to fetch policies");
            }
            const data: PolicyWithRelations[] = await response.json();
            setPolicies(data);
        } catch (error) {
            console.error("Error fetching policies:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPolicies();
    }, [fetchPolicies]);

    // Toggle selected policy when clicking a row
    const handlePolicySelect = (policy: PolicyWithRelations) => {
        if (selectedPolicy?.id === policy.id) {
            setShowDetails(prev => !prev);
        } else {
            setSelectedPolicy(policy);
            setShowDetails(true);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Policies</h1>
                <CreatePolicyForm onSuccess={fetchPolicies} onCancel={() => { }} />
            </div>
            <DataTable
                columns={createColumns({ onPolicyUpdate: fetchPolicies })}
                data={policies}
                onRowClick={handlePolicySelect}
                selectedRow={selectedPolicy}
            />
            {showDetails && selectedPolicy && (
                <PolicyDetail
                    policy={selectedPolicy}
                    onClose={() => setShowDetails(false)}
                />
            )}
        </div>
    );
}
