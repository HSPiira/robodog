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
import { Loader2, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/context/auth-context";

interface DeleteStickerDialogProps {
    stickerId: string;
    stickerNo: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStickerDeleted: () => void;
}

export function DeleteStickerDialog({
    stickerId,
    stickerNo,
    open,
    onOpenChange,
    onStickerDeleted,
}: DeleteStickerDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { token } = useAuth();

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const response = await fetch(`/api/stickers/${stickerId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": token ? `Bearer ${token}` : "",
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete sticker");
            }

            toast.success("Sticker deleted successfully");
            onOpenChange(false);
            onStickerDeleted();
        } catch (error) {
            console.error("Error deleting sticker:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to delete sticker";
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-500">
                        <Trash2 className="h-4 w-4" />
                        Delete Sticker
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete sticker <strong>"{stickerNo}"</strong>?
                        This action cannot be undone.
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
    );
} 