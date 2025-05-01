"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { PolicyDetail } from "./components/policy-detail";
import { CreatePolicyForm } from "./components/create-policy-form";
import { Policy } from "./components/columns";
import { useToast } from "@/components/ui/use-toast";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PoliciesPage() {
    const { toast } = useToast();
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        fetchPolicies();
    }, []);

    async function fetchPolicies() {
        try {
            const response = await fetch("/api/policies", {
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error("Failed to fetch policies");
            }
            const data = await response.json();
            setPolicies(data);
        } catch (error) {
            console.error("Error fetching policies:", error);
            toast({
                title: "Error",
                description: "Failed to fetch policies",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleRowClick = (policy: Policy) => {
        setSelectedPolicy(policy);
    };

    const handleCreateSuccess = () => {
        setShowCreateForm(false);
        fetchPolicies();
    };

    return (
        <div className="space-y-6">
            {isLoading && policies.length === 0 ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="flex gap-6">
                    <div className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${selectedPolicy ? '' : 'w-full'}`}>
                        <DataTable
                            columns={columns}
                            data={policies}
                            searchKey="policyNo"
                            actionButton={
                                <div className="flex items-center gap-2">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    onClick={() => setShowCreateForm(true)}
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Create new policy</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            }
                            onRowClick={handleRowClick}
                            fetchData={fetchPolicies}
                            selectedRow={selectedPolicy}
                        />
                    </div>
                    <div className={`flex-shrink-0 transition-all duration-300 ease-in-out ${selectedPolicy ? 'w-[320px] opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
                        {selectedPolicy && (
                            <PolicyDetail
                                policy={selectedPolicy}
                                onClose={() => setSelectedPolicy(null)}
                            />
                        )}
                    </div>
                </div>
            )}

            {showCreateForm && (
                <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-auto">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-3xl mx-4 my-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Create New Policy</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => setShowCreateForm(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <CreatePolicyForm
                            onSuccess={handleCreateSuccess}
                            onCancel={() => setShowCreateForm(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
} 