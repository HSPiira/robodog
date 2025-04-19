"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { UserDialog } from "@/components/users/user-dialog";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import { toast } from "sonner";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Fetch users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/users");

            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle edit user
    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsEditMode(true);
        setIsUserDialogOpen(true);
    };

    // Handle delete user
    const handleDeleteUser = (user: User) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    // Handle add user
    const handleAddUser = () => {
        setSelectedUser(null);
        setIsEditMode(false);
        setIsUserDialogOpen(true);
    };

    // Handle user dialog close
    const handleUserDialogClose = (success: boolean) => {
        setIsUserDialogOpen(false);
        if (success) {
            fetchUsers();
            toast.success(isEditMode ? "User updated successfully" : "User created successfully");
        }
    };

    // Handle delete dialog close
    const handleDeleteDialogClose = async (confirmed: boolean) => {
        setIsDeleteDialogOpen(false);

        if (confirmed && selectedUser) {
            try {
                const response = await fetch(`/api/users/${selectedUser.id}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    throw new Error("Failed to delete user");
                }

                fetchUsers();
                toast.success("User deleted successfully");
            } catch (error) {
                console.error("Error deleting user:", error);
                toast.error("Failed to delete user");
            }
        }
    };

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Users</h1>
                <Button onClick={handleAddUser}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p>Loading users...</p>
                </div>
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-4">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${user.isActive
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {user.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {format(new Date(user.createdAt), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleEditUser(user)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleDeleteUser(user)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* User Dialog */}
            <UserDialog
                open={isUserDialogOpen}
                onClose={handleUserDialogClose}
                user={selectedUser}
                isEditMode={isEditMode}
            />

            {/* Delete Dialog */}
            <DeleteUserDialog
                open={isDeleteDialogOpen}
                onClose={handleDeleteDialogClose}
                user={selectedUser}
            />
        </div>
    );
} 