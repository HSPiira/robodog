"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Edit2,
    Plus,
    Trash2,
    Save,
    SearchIcon,
    MoreHorizontal,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Building2,
    Mail,
    Phone,
    X,
    CheckCircle,
    XCircle,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { InsurerDetail } from "./components/insurer-detail";

interface Insurer {
    id: string;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Add constants for pagination
const ITEMS_PER_PAGE = 10;

export default function InsurersPage() {
    const { toast } = useToast();
    const [insurers, setInsurers] = useState<Insurer[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [selectedInsurer, setSelectedInsurer] = useState<Insurer | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editingInsurer, setEditingInsurer] = useState<Insurer | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const [formErrors, setFormErrors] = useState({
        name: "",
        email: "",
        phone: "",
    });

    // Add new state
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newInsurerData, setNewInsurerData] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const [newInsurerErrors, setNewInsurerErrors] = useState({
        name: "",
        email: "",
        phone: "",
    });

    // Delete state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingInsurerId, setDeletingInsurerId] = useState<string | null>(null);

    useEffect(() => {
        fetchInsurers();
    }, []);

    const fetchInsurers = async () => {
        setIsFetching(true);
        try {
            const response = await fetch("/api/insurers");
            const data = await response.json();
            setInsurers(data);

            // If an insurer is selected, refresh it with the latest data
            if (selectedInsurer) {
                const updatedSelectedInsurer = data.find(
                    (insurer: Insurer) => insurer.id === selectedInsurer.id
                );
                if (updatedSelectedInsurer) {
                    setSelectedInsurer(updatedSelectedInsurer);
                }
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch insurers",
                variant: "destructive",
            });
        } finally {
            setIsFetching(false);
        }
    };

    // Filter and sort insurers
    const filteredInsurers = useMemo(() => {
        return insurers
            .filter(insurer =>
                insurer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                insurer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                insurer.phone.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                const compareValue = sortDirection === "asc" ? 1 : -1;
                return a.name.localeCompare(b.name) * compareValue;
            });
    }, [insurers, searchTerm, sortDirection]);

    // Calculate pagination
    const paginatedInsurers = useMemo(() => {
        const startIndex = currentPage * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredInsurers.slice(startIndex, endIndex);
    }, [filteredInsurers, currentPage]);

    useEffect(() => {
        setTotalPages(Math.ceil(filteredInsurers.length / ITEMS_PER_PAGE));
        if (currentPage >= Math.ceil(filteredInsurers.length / ITEMS_PER_PAGE)) {
            setCurrentPage(0);
        }
    }, [filteredInsurers, currentPage]);

    const handleRowClick = (insurer: Insurer) => {
        setSelectedInsurer(insurer.id === selectedInsurer?.id ? null : insurer);
    };

    const handleDeleteOpen = (id: string) => {
        setDeletingInsurerId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!editingInsurer || !formData.name.trim()) return;

        setIsSaving(true);
        try {
            const response = await fetch(`/api/insurers/${editingInsurer.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to update insurer");
            }

            toast({
                title: "Updated Successfully",
                description: "Insurer has been updated",
            });

            await fetchInsurers();
            setIsEditing(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddNewSubmit = async () => {
        if (!newInsurerData.name.trim()) return;

        setIsSaving(true);
        try {
            const response = await fetch("/api/insurers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newInsurerData),
            });

            if (!response.ok) {
                throw new Error("Failed to create insurer");
            }

            const newInsurer = await response.json();
            toast({
                title: "Created Successfully",
                description: "New insurer has been created",
            });

            await fetchInsurers();
            setSelectedInsurer(newInsurer);
            setIsAddingNew(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSubmit = async () => {
        if (!deletingInsurerId) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/insurers/${deletingInsurerId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete insurer");
            }

            toast({
                title: "Deleted Successfully",
                description: "The insurer has been deleted",
            });

            if (selectedInsurer?.id === deletingInsurerId) {
                setSelectedInsurer(null);
            }

            await fetchInsurers();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setDeletingInsurerId(null);
        }
    };

    return (
        <Card className="p-6">
            <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold tracking-tight">Insurers</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
                Manage insurance companies in the system
            </p>

            <div className="mt-6 flex items-center gap-4">
                <div className="flex-1 flex items-center gap-4">
                    <div className="relative w-[280px] bg-muted rounded-full">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-500 dark:text-blue-400" />
                        <Input
                            placeholder="Search insurers..."
                            className="w-full pl-9 h-9 text-xs border-0 bg-transparent focus-visible:ring-0 rounded-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs rounded-full hover:bg-muted"
                        onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                    >
                        Sort{" "}
                        {sortDirection === "asc" ? (
                            <ChevronUp className="h-3 w-3 ml-1" />
                        ) : (
                            <ChevronDown className="h-3 w-3 ml-1" />
                        )}
                    </Button>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    className="h-8 w-8 rounded-full bg-muted hover:bg-muted/80"
                                    variant="ghost"
                                    onClick={() => setIsAddingNew(true)}
                                >
                                    <Plus className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Add Insurer</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <div className="mt-4 flex gap-4">
                <div className={cn(
                    "flex-1 min-w-0",
                    selectedInsurer && "max-w-[calc(100%-336px)]"
                )}>
                    <div className="rounded-lg border bg-card overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted hover:bg-muted">
                                    <TableHead className="text-[0.8rem] font-medium">Name</TableHead>
                                    {!selectedInsurer && (
                                        <>
                                            <TableHead className="text-[0.8rem] font-medium">Email</TableHead>
                                            <TableHead className="text-[0.8rem] font-medium">Phone</TableHead>
                                        </>
                                    )}
                                    <TableHead className="text-[0.8rem] font-medium w-[100px]">Status</TableHead>
                                    <TableHead className="text-[0.8rem] font-medium w-[50px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isFetching ? (
                                    <TableRow>
                                        <TableCell colSpan={selectedInsurer ? 3 : 5} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500 dark:text-blue-400" />
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedInsurers.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={selectedInsurer ? 3 : 5}
                                            className="h-24 text-center text-[0.8rem] text-muted-foreground"
                                        >
                                            No insurers found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedInsurers.map((insurer) => (
                                        <TableRow
                                            key={insurer.id}
                                            className={cn(
                                                "cursor-pointer transition-colors hover:bg-muted",
                                                selectedInsurer?.id === insurer.id && "bg-muted"
                                            )}
                                            onClick={() => handleRowClick(insurer)}
                                        >
                                            <TableCell className="py-1 px-2 h-7 text-xs font-medium whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                                    <span>{insurer.name}</span>
                                                </div>
                                            </TableCell>
                                            {!selectedInsurer && (
                                                <>
                                                    <TableCell className="py-1 px-2 h-7 text-xs text-muted-foreground whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                                            <span className="truncate">{insurer.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-1 px-2 h-7 text-xs text-muted-foreground whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                                            <span>{insurer.phone}</span>
                                                        </div>
                                                    </TableCell>
                                                </>
                                            )}
                                            <TableCell className="py-1 px-2 h-7">
                                                <Badge
                                                    variant={insurer.isActive ? "default" : "secondary"}
                                                    className="text-[0.7rem] font-medium flex items-center gap-1.5"
                                                >
                                                    {insurer.isActive ? (
                                                        <CheckCircle className="h-3 w-3" />
                                                    ) : (
                                                        <XCircle className="h-3 w-3" />
                                                    )}
                                                    {insurer.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-1 px-2 h-7 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="h-5 w-5 p-0"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <MoreHorizontal className="h-3 w-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[160px]">
                                                        <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-xs cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setIsEditing(true);
                                                            }}
                                                        >
                                                            <Edit2 className="h-3.5 w-3.5 mr-2 text-primary" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-xs text-destructive cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteOpen(insurer.id);
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
                        <div className="flex items-center justify-between px-2 py-2 border-t">
                            <p className="text-[0.8rem] text-muted-foreground">
                                Showing {currentPage * ITEMS_PER_PAGE + 1} to{" "}
                                {Math.min(
                                    (currentPage + 1) * ITEMS_PER_PAGE,
                                    filteredInsurers.length
                                )}{" "}
                                of {filteredInsurers.length} items
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 rounded-full hover:bg-muted"
                                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                    disabled={currentPage === 0}
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>
                                <p className="text-[0.8rem]">
                                    Page {currentPage + 1} of{" "}
                                    {Math.max(1, Math.ceil(filteredInsurers.length / ITEMS_PER_PAGE))}
                                </p>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7 rounded-full hover:bg-muted"
                                    onClick={() =>
                                        setCurrentPage(
                                            Math.min(
                                                Math.ceil(filteredInsurers.length / ITEMS_PER_PAGE) - 1,
                                                currentPage + 1
                                            )
                                        )
                                    }
                                    disabled={
                                        currentPage >=
                                        Math.ceil(filteredInsurers.length / ITEMS_PER_PAGE) - 1
                                    }
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {selectedInsurer && (
                    <div className="w-[320px]">
                        <InsurerDetail
                            insurer={selectedInsurer}
                            onClose={() => setSelectedInsurer(null)}
                            onEdit={() => setIsEditing(true)}
                            onDelete={handleDeleteOpen}
                        />
                    </div>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Insurer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-9 text-sm"
                            />
                            {formErrors.name && (
                                <p className="text-xs text-destructive">{formErrors.name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="h-9 text-sm"
                            />
                            {formErrors.email && (
                                <p className="text-xs text-destructive">{formErrors.email}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-phone">Phone</Label>
                            <Input
                                id="edit-phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="h-9 text-sm"
                            />
                            {formErrors.phone && (
                                <p className="text-xs text-destructive">{formErrors.phone}</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                className="h-9 text-xs"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="h-9 text-xs"
                                onClick={() => handleEditSubmit()}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-3.5 w-3.5 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add New Dialog */}
            <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Insurer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-name">Name</Label>
                            <Input
                                id="new-name"
                                value={newInsurerData.name}
                                onChange={(e) => setNewInsurerData({ ...newInsurerData, name: e.target.value })}
                                className="h-9 text-sm"
                            />
                            {newInsurerErrors.name && (
                                <p className="text-xs text-destructive">{newInsurerErrors.name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-email">Email</Label>
                            <Input
                                id="new-email"
                                type="email"
                                value={newInsurerData.email}
                                onChange={(e) => setNewInsurerData({ ...newInsurerData, email: e.target.value })}
                                className="h-9 text-sm"
                            />
                            {newInsurerErrors.email && (
                                <p className="text-xs text-destructive">{newInsurerErrors.email}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-phone">Phone</Label>
                            <Input
                                id="new-phone"
                                type="tel"
                                value={newInsurerData.phone}
                                onChange={(e) => setNewInsurerData({ ...newInsurerData, phone: e.target.value })}
                                className="h-9 text-sm"
                            />
                            {newInsurerErrors.phone && (
                                <p className="text-xs text-destructive">{newInsurerErrors.phone}</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                className="h-9 text-xs"
                                onClick={() => setIsAddingNew(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="h-9 text-xs"
                                onClick={() => handleAddNewSubmit()}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-3.5 w-3.5 mr-2" />
                                        Create Insurer
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Delete Insurer
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm">
                            Are you sure you want to delete this insurer? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                className="h-9 text-xs"
                                onClick={() => setIsDeleteDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                className="h-9 text-xs"
                                onClick={() => handleDeleteSubmit()}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                        Delete
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
} 