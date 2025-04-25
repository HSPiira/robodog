"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
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
    MapPin,
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
import { AddInsurerDialog } from "./components/add-insurer-dialog";
import { EditInsurerDialog } from "./components/edit-insurer-dialog";
import { format } from "date-fns";

interface Insurer {
    id: string;
    name: string;
    email?: string;
    address?: string;
    phone?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    description?: string;
}

// Add constants for pagination
const ITEMS_PER_PAGE = 10;

// Define the styling constants
const tabStyles = {
    color: "text-blue-500",
    bgColor: "bg-blue-50/70 dark:bg-blue-950/20",
    accentColor: "bg-blue-500",
    hoverColor: "hover:text-blue-600 hover:bg-blue-50",
    activeText: "text-blue-700 dark:text-blue-300",
};

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

    // Add new state
    const [isAddingNew, setIsAddingNew] = useState(false);

    // Delete state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingInsurerId, setDeletingInsurerId] = useState<string | null>(null);

    useEffect(() => {
        fetchInsurers();
    }, []);

    const fetchInsurers = async () => {
        setIsFetching(true);
        try {
            // With HttpOnly cookies, no manual token extraction needed
            const response = await fetch("/api/insurers", {
                credentials: "include", // This sends cookies with the request
            });

            if (!response.ok) {
                if (response.status === 401) {
                    toast({
                        title: "Authentication Error",
                        description: "Please log in again",
                        variant: "destructive",
                    });
                    return;
                }
                throw new Error("Failed to fetch insurers");
            }

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
                (insurer.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (insurer.phone?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (insurer.address?.toLowerCase() || "").includes(searchTerm.toLowerCase())
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

    const handleDeleteSubmit = async () => {
        if (!deletingInsurerId) return;

        setIsDeleting(true);
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`/api/insurers/${deletingInsurerId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": token ? `Bearer ${token}` : "",
                },
            });

            if (response.status === 401) {
                toast({
                    title: "Authentication Error",
                    description: "Please log in again to continue.",
                    variant: "destructive",
                });
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to delete insurer");
            }

            toast({
                title: "Success",
                description: "Insurer deleted successfully",
            });

            if (selectedInsurer?.id === deletingInsurerId) {
                setSelectedInsurer(null);
            }

            await fetchInsurers();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error("Error deleting insurer:", error);
            toast({
                title: "Error",
                description: "Failed to delete insurer. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setDeletingInsurerId(null);
        }
    };

    const formatDate = (date: string) => {
        return format(new Date(date), "MMM d, yyyy");
    };

    const handleEdit = (insurer: Insurer) => {
        setEditingInsurer(insurer);
        setIsEditing(true);
    };

    const handleDelete = (id: string) => {
        setSelectedInsurer(null);
        handleDeleteOpen(id);
    };

    return (
        <div className="space-y-6 px-1 sm:px-2 md:px-0">
            <Card>
                <CardContent className="p-0">
                    <div className="space-y-4 p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                            <div className="relative flex-1 sm:w-[280px] w-full max-w-full sm:max-w-[280px]">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-500" />
                                <Input
                                    placeholder="Search insurers..."
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
                                    onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                                >
                                    Sort{" "}
                                    {sortDirection === "asc" ? (
                                        <ChevronUp className="h-3 w-3 ml-1 text-blue-500" />
                                    ) : (
                                        <ChevronDown className="h-3 w-3 ml-1 text-blue-500" />
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
                                                <Plus className="h-3 w-3 text-blue-500" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Add Insurer</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className={cn(
                                "transition-all duration-200 rounded-md border",
                                selectedInsurer ? "lg:col-span-7 md:col-span-6 col-span-12" : "col-span-12"
                            )}>
                                <Table className="text-xs">
                                    <TableHeader className={tabStyles.bgColor}>
                                        <TableRow>
                                            <TableHead className="text-xs font-medium py-1 h-6 border-b border-border/40 px-2 w-[160px] sm:w-[200px]">Name</TableHead>
                                            <TableHead className={cn(
                                                "text-xs font-medium py-1 h-6 border-b border-border/40 px-2",
                                                selectedInsurer && "hidden md:hidden"
                                            )}>Email</TableHead>
                                            <TableHead className={cn(
                                                "text-xs font-medium py-1 h-6 border-b border-border/40 px-2",
                                                selectedInsurer && "hidden md:hidden"
                                            )}>Phone</TableHead>
                                            <TableHead className="text-xs font-medium py-1 h-6 border-b border-border/40 px-2 w-[100px]">Status</TableHead>
                                            <TableHead className={cn(
                                                "text-xs font-medium py-1 h-6 border-b border-border/40 px-2",
                                                selectedInsurer && "hidden md:hidden"
                                            )}>Updated</TableHead>
                                            <TableHead className="text-xs font-medium py-1 h-6 border-b border-border/40 px-2 text-right w-[50px] sm:w-[60px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isFetching ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-[200px] text-center">
                                                    <div className="flex flex-col items-center justify-center h-full">
                                                        <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-500" />
                                                        <p className="text-sm text-muted-foreground">Loading data...</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : paginatedInsurers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-[200px] text-center">
                                                    <div className="flex flex-col items-center justify-center h-full">
                                                        <AlertCircle className="h-8 w-8 mb-2 text-muted-foreground" />
                                                        <p className="text-sm text-muted-foreground">No insurers found</p>
                                                        {searchTerm && (
                                                            <Button
                                                                variant="link"
                                                                size="sm"
                                                                onClick={() => setSearchTerm("")}
                                                                className="mt-2 text-blue-500"
                                                            >
                                                                Clear search
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedInsurers.map((insurer) => (
                                                <TableRow
                                                    key={insurer.id}
                                                    className={cn(
                                                        "cursor-pointer",
                                                        tabStyles.hoverColor,
                                                        selectedInsurer?.id === insurer.id && tabStyles.bgColor
                                                    )}
                                                    onClick={() => handleRowClick(insurer)}
                                                >
                                                    <TableCell className="py-1 px-2 h-7 text-xs font-medium whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                                            <span>{insurer.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className={cn(
                                                        "py-1 px-2 h-7 text-xs text-muted-foreground",
                                                        selectedInsurer && "hidden md:hidden"
                                                    )}>
                                                        {insurer.email || "—"}
                                                    </TableCell>
                                                    <TableCell className={cn(
                                                        "py-1 px-2 h-7 text-xs text-muted-foreground",
                                                        selectedInsurer && "hidden md:hidden"
                                                    )}>
                                                        {insurer.phone || "—"}
                                                    </TableCell>
                                                    <TableCell className="py-1 px-2 h-7 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            {insurer.isActive ? (
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
                                                        selectedInsurer && "hidden md:hidden"
                                                    )}>
                                                        {format(new Date(insurer.updatedAt), "MMM d, yyyy")}
                                                    </TableCell>
                                                    <TableCell className="py-1 px-2 h-7 text-xs text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="text-xs">
                                                                <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-xs"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEdit(insurer);
                                                                    }}
                                                                >
                                                                    <Edit2 className="h-3.5 w-3.5 mr-2 text-blue-500" /> Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-xs text-red-600"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDelete(insurer.id);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
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
                                {filteredInsurers.length > 0 && (
                                    <div className="flex items-center justify-between px-2 py-2 border-t border-border/40">
                                        <div className="text-xs text-muted-foreground">
                                            Showing {Math.min(filteredInsurers.length, currentPage * ITEMS_PER_PAGE + 1)} to {Math.min(filteredInsurers.length, (currentPage + 1) * ITEMS_PER_PAGE)} of {filteredInsurers.length} items
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
                            {selectedInsurer && (
                                <div className="lg:col-span-5 md:col-span-6 col-span-12">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Building2 className="h-5 w-5 text-blue-500" />
                                                    <CardTitle className="text-base font-semibold">{selectedInsurer.name}</CardTitle>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full"
                                                    onClick={() => setSelectedInsurer(null)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="space-y-4 text-xs">
                                                <div>
                                                    <h4 className="font-semibold text-muted-foreground">Contact Information</h4>
                                                    <div className="mt-2 space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="h-3.5 w-3.5 text-blue-500" />
                                                            <span>{selectedInsurer.email || "No email provided"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-3.5 w-3.5 text-blue-500" />
                                                            <span>{selectedInsurer.phone || "No phone provided"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                                            <span>{selectedInsurer.address || "No address provided"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-muted-foreground">Status</h4>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        {selectedInsurer.isActive ? (
                                                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                                        ) : (
                                                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                                                        )}
                                                        <span>
                                                            {selectedInsurer.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-muted-foreground">ID</h4>
                                                    <p className="font-mono text-[10px] bg-blue-50/70 dark:bg-blue-950/20 p-1 rounded mt-1">{selectedInsurer.id}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="font-semibold text-muted-foreground">Created</h4>
                                                        <p className="mt-1">{format(new Date(selectedInsurer.createdAt), "MMM d, yyyy")}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-muted-foreground">Last Updated</h4>
                                                        <p className="mt-1">{format(new Date(selectedInsurer.updatedAt), "MMM d, yyyy")}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 pt-2 border-t">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-xs rounded-full"
                                                        onClick={() => handleEdit(selectedInsurer)}
                                                    >
                                                        <Edit2 className="h-3 w-3 mr-1 text-blue-500" /> Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="h-7 text-xs rounded-full"
                                                        onClick={() => handleDelete(selectedInsurer.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Add New Dialog */}
            <AddInsurerDialog
                open={isAddingNew}
                onOpenChange={setIsAddingNew}
                onSuccess={fetchInsurers}
            />

            {/* Edit Dialog */}
            <EditInsurerDialog
                insurer={editingInsurer}
                open={isEditing}
                onOpenChange={setIsEditing}
                onSuccess={fetchInsurers}
            />

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
                                onClick={handleDeleteSubmit}
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
        </div>
    );
} 