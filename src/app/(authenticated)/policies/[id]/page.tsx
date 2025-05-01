"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Policy, PolicyStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PolicyDetail } from "../components/policy-detail";

type PolicyWithRelations = Policy & {
    client: { id: string; name: string };
    insurer: { id: string; name: string };
};

export default function PolicyDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const [policy, setPolicy] = useState<PolicyWithRelations | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchPolicy = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/policies/${params.id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch policy");
            }
            const data = await response.json();
            setPolicy({
                ...data,
                validFrom: new Date(data.validFrom),
                validTo: new Date(data.validTo),
            });
        } catch (error) {
            console.error("Error fetching policy:", error);
            toast({
                title: "Error",
                description: "Failed to fetch policy",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicy();
    }, [params.id, toast]);

    const handleRefresh = async () => {
        fetchPolicy();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!policy) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Policy Not Found</h1>
                    <Button onClick={() => router.push("/policies")}>Back to Policies</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Policy Details</h1>
                <div className="flex space-x-4">
                    <Button variant="outline" onClick={handleRefresh}>
                        Refresh
                    </Button>
                    <Button onClick={() => router.push("/policies")}>Back to Policies</Button>
                </div>
            </div>

            <PolicyDetail policy={policy} onClose={() => router.back()} />
        </div>
    );
} 