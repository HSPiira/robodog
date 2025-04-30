'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Edit2,
    Plus,
    Trash2,
    Save,
    X,
    ChevronDown,
    ChevronUp,
    MoreHorizontal,
    SearchIcon,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle,
    Shield,
    User2,
    CheckCircle,
    XCircle,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { UserDetail } from "./components/user-detail";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

// Constants
const ITEMS_PER_PAGE = 10;
const ROLES = ['ADMIN', 'USER', 'MANAGER'];

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
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '',
        name: '',
        password: '',
        role: 'USER',
        isActive: true,
    });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Fetch users
    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/users');
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load users',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSave = async () => {
        if (!editingUser) return;

        try {
            const response = await fetch(`/api/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingUser),
            });

            if (!response.ok) throw new Error('Failed to update user');

            await fetchUsers();
            setEditingUser(null);
            toast({
                title: 'Success',
                description: 'User updated successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update user',
                variant: 'destructive',
            });
        }
    };

    const handleAddNew = async () => {
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) throw new Error('Failed to create user');

            await fetchUsers();
            setIsAddingNew(false);
            setNewUser({
                email: '',
                name: '',
                password: '',
                role: 'USER',
                isActive: true,
            });
            toast({
                title: 'Success',
                description: 'User created successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create user',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = (userId: string) => {
        setDeletingUserId(userId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingUserId) return;

        try {
            const response = await fetch(`/api/users/${deletingUserId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete user');

            await fetchUsers();
            setIsDeleteDialogOpen(false);
            setDeletingUserId(null);
            toast({
                title: 'Success',
                description: 'User deleted successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete user',
                variant: 'destructive',
            });
        }
    };

    // Filter and sort entries
    const filteredUsers = users
        .filter((user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const compareValue = sortDirection === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
            return compareValue;
        });

    // Calculate pagination
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    return (
        <div className="space-y-6 px-1 sm:px-2 md:px-0">
            <Card>
                <CardContent className="p-0">
                    <div className="space-y-4 p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                            <div className="relative flex-1 sm:w-[280px] w-full max-w-full sm:max-w-[280px]">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-500" />
                                <Input
                                    placeholder="Search users..."
                                    className="w-full pl-9 h-9 text-xs border-0 bg-muted/50 hover:bg-muted focus:bg-background rounded-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs rounded-full hover:bg-muted"
                                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                                >
                                    Sort{' '}
                                    {sortDirection === 'asc' ? (
                                        <ChevronUp className="h-3 w-3 ml-1 text-blue-500" />
                                    ) : (
                                        <ChevronDown className="h-3 w-3 ml-1 text-blue-500" />
                                    )}
                                </Button>
                                <Button
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => setIsAddingNew(true)}
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className={cn(
                                "transition-all duration-200 rounded-md border",
                                selectedUser ? "lg:col-span-7 md:col-span-6 col-span-12" : "col-span-12"
                            )}>
                                <Table className="text-xs">
                                    <TableHeader className="bg-blue-50/70 dark:bg-blue-950/20">
                                        <TableRow>
                                            <TableHead className="text-xs font-medium py-1 h-6 border-b border-border/40 px-2">Name</TableHead>
                                            <TableHead className={cn(
                                                "text-xs font-medium py-1 h-6 border-b border-border/40 px-2",
                                                selectedUser && "hidden md:hidden"
                                            )}>Email</TableHead>
                                            <TableHead className={cn(
                                                "text-xs font-medium py-1 h-6 border-b border-border/40 px-2",
                                                selectedUser && "hidden md:hidden"
                                            )}>Role</TableHead>
                                            <TableHead className="text-xs font-medium py-1 h-6 border-b border-border/40 px-2">Status</TableHead>
                                            <TableHead className={cn(
                                                "text-xs font-medium py-1 h-6 border-b border-border/40 px-2",
                                                selectedUser && "hidden md:hidden"
                                            )}>Updated</TableHead>
                                            <TableHead className="text-xs font-medium py-1 h-6 border-b border-border/40 px-2 text-right w-[60px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-[200px] text-center">
                                                    <div className="flex flex-col items-center justify-center h-full">
                                                        <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-500" />
                                                        <p className="text-sm text-muted-foreground">Loading users...</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : paginatedUsers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-[200px] text-center">
                                                    <div className="flex flex-col items-center justify-center h-full">
                                                        <AlertCircle className="h-8 w-8 mb-2 text-muted-foreground" />
                                                        <p className="text-sm text-muted-foreground">No users found</p>
                                                        {searchTerm && (
                                                            <Button
                                                                variant="link"
                                                                size="sm"
                                                                onClick={() => setSearchTerm('')}
                                                                className="mt-2 text-blue-500"
                                                            >
                                                                Clear search
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedUsers.map((user) => (
                                                <TableRow
                                                    key={user.id}
                                                    className={cn(
                                                        "cursor-pointer hover:bg-muted/50",
                                                        selectedUser?.id === user.id && "bg-blue-50/70 dark:bg-blue-950/20"
                                                    )}
                                                    onClick={() => setSelectedUser(user.id === selectedUser?.id ? null : user)}
                                                >
                                                    <TableCell className="py-1 px-2 h-7 text-xs font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <User2 className="h-3.5 w-3.5 text-blue-500" />
                                                            {user.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className={cn(
                                                        "py-1 px-2 h-7 text-xs text-muted-foreground",
                                                        selectedUser && "hidden md:hidden"
                                                    )}>
                                                        {user.email}
                                                    </TableCell>
                                                    <TableCell className={cn(
                                                        "py-1 px-2 h-7 text-xs",
                                                        selectedUser && "hidden md:hidden"
                                                    )}>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                'text-xs h-5 rounded-full',
                                                                user.role === 'ADMIN' && 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
                                                                user.role === 'MANAGER' && 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                            )}
                                                        >
                                                            <Shield className="h-3 w-3 mr-1" />
                                                            {user.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-1 px-2 h-7 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            {user.isActive ? (
                                                                <>
                                                                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                                                    <span className="text-green-600 dark:text-green-400">Active</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                                                                    <span className="text-red-600 dark:text-red-400">Inactive</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className={cn(
                                                        "py-1 px-2 h-7 text-xs text-muted-foreground",
                                                        selectedUser && "hidden md:hidden"
                                                    )}>
                                                        {format(new Date(user.updatedAt), "MMM d, yyyy")}
                                                    </TableCell>
                                                    <TableCell className="py-1 px-2 h-7 text-xs text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="text-xs">
                                                                <DropdownMenuItem onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingUser(user);
                                                                }}>
                                                                    <Edit2 className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-red-600"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDelete(user.id);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>

                                {/* Pagination controls */}
                                {filteredUsers.length > 0 && (
                                    <div className="flex items-center justify-between px-2 py-2 border-t border-border/40">
                                        <div className="text-xs text-muted-foreground">
                                            Showing {Math.min(filteredUsers.length, currentPage * ITEMS_PER_PAGE + 1)} to {Math.min(filteredUsers.length, (currentPage + 1) * ITEMS_PER_PAGE)} of {filteredUsers.length} users
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setCurrentPage(Math.max(currentPage - 1, 0))}
                                                disabled={currentPage === 0}
                                                className="h-7 w-7 rounded-full"
                                            >
                                                <ChevronLeft className={cn("h-3.5 w-3.5", currentPage === 0 ? "text-muted-foreground" : "text-blue-500")} />
                                                <span className="sr-only">Previous</span>
                                            </Button>
                                            <div className="text-xs">
                                                Page {currentPage + 1} of {totalPages || 1}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages - 1))}
                                                disabled={currentPage >= totalPages - 1}
                                                className="h-7 w-7 rounded-full"
                                            >
                                                <ChevronRight className={cn("h-3.5 w-3.5", currentPage >= totalPages - 1 ? "text-muted-foreground" : "text-blue-500")} />
                                                <span className="sr-only">Next</span>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Details Card */}
                            {selectedUser && (
                                <div className="lg:col-span-5 md:col-span-6 col-span-12">
                                    <UserDetail
                                        user={selectedUser}
                                        onClose={() => setSelectedUser(null)}
                                        onEdit={(user) => {
                                            setEditingUser(user);
                                            setSelectedUser(null);
                                        }}
                                        onDelete={(id) => {
                                            handleDelete(id);
                                            setSelectedUser(null);
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Add New Dialog */}
            <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label className="text-xs">Name</Label>
                            <Input
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                placeholder="Enter user's name"
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Email</Label>
                            <Input
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                placeholder="Enter user's email"
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Password</Label>
                            <Input
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="Enter password"
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Role</Label>
                            <Select
                                value={newUser.role}
                                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLES.map((role) => (
                                        <SelectItem key={role} value={role} className="text-xs">
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleAddNew} className="w-full h-8 text-xs">
                            Add User
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Delete User
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm">
                            Are you sure you want to delete this user? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={() => setIsDeleteDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                className="h-8 text-xs"
                                onClick={confirmDelete}
                            >
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 