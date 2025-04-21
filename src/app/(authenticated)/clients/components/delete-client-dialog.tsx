"use client";

import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/context/auth-context";

interface DeleteClientDialogProps {
    clientId: string;
    clientName: string;
    onClientDeleted: () => void;
}

export function DeleteClientDialog({
    clientId,
    clientName,
    onClientDeleted,
}: DeleteClientDialogProps) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { token } = useAuth();

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const response = await fetch(`/api/clients/${clientId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": token ? `Bearer ${token}` : "",
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete client");
            }

            toast.success("Client deleted successfully");
            setOpen(false);
            onClientDeleted();
        } catch (error) {
            console.error("Error deleting client:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to delete client";
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <DropdownMenuItem
                className="text-xs text-red-600"
                onClick={() => setOpen(true)}
                onSelect={(e) => e.preventDefault()}
            >
                Delete
            </DropdownMenuItem>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the client <strong>"{clientName}"</strong> and cannot be undone.
                            <br /><br />
                            Note: Clients with active policies cannot be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 