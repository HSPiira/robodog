"use client";

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

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
}

interface DeleteUserDialogProps {
    open: boolean;
    onClose: (confirmed: boolean) => void;
    user: User | null;
}

export function DeleteUserDialog({
    open,
    onClose,
    user,
}: DeleteUserDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={() => onClose(false)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will deactivate the user account for{" "}
                        <span className="font-semibold">{user?.name}</span> (
                        {user?.email}). This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onClose(false)}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={() => onClose(true)}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
} 