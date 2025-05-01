"use client";

import { useEffect, useState, useCallback } from "react";
import { columns as policyColumns } from "./components/columns";
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
        <div className="container mx-auto py-6 space-y-6">
            {loading && policies.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="flex gap-6 h-[calc(100vh-12rem)]">
                    <div className="flex-1 min-w-0">
                        <DataTable
                            columns={policyColumns}
                            data={policies}
                            searchKey="policyNo"
                            actionButton={
                                <CreatePolicyForm
                                    onSuccess={fetchPolicies}
                                    onCancel={() => { }}
                                />
                            }
                            onRowClick={handlePolicySelect}
                            selectedRow={selectedPolicy}
                        />
                    </div>
                    <div className={`flex-shrink-0 transition-all duration-300 ease-in-out ${showDetails ? 'w-[400px] opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
                        {selectedPolicy && (
                            <PolicyDetail
                                policy={selectedPolicy}
                                onClose={() => setShowDetails(false)}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
