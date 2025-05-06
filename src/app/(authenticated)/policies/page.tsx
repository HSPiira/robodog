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
        <div className="p-6">
            <div className="flex gap-6">
                <div className="flex-1">
                    <DataTable
                        columns={createColumns()}
                        data={policies}
                        searchKey="policyNo"
                        actionButton={<CreatePolicyForm onSuccess={fetchPolicies} onCancel={() => { }} />}
                        onRowClick={handlePolicySelect}
                        selectedRow={selectedPolicy || undefined}
                        loading={loading}
                    />
                </div>
                {showDetails && selectedPolicy && (
                    <div className="w-[400px]">
                        <PolicyDetail
                            policy={selectedPolicy}
                            onClose={() => setShowDetails(false)}
                            onPolicyUpdate={fetchPolicies}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
