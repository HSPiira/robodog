"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
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
    X,
    Mail,
    Phone,
    Clock,
    RefreshCw,
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
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";

interface Insurer {
    id: string;
    name: string;
    code: string;
    email: string;
    phone: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Add constants for pagination
const ITEMS_PER_PAGE = 10;

interface InsurerDetailProps {
    insurer: Insurer;
    onClose: () => void;
}

const InsurerDetail = ({ insurer, onClose }: InsurerDetailProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
        >
            <Card>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">{insurer.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant={insurer.isActive ? "default" : "secondary"} className="text-xs font-medium">
                                    {insurer.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="mt-4 grid gap-4">
                        <div className="grid gap-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Contact Information</p>
                                    <div className="mt-1 space-y-2">
                                        <p className="flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                            {insurer.email}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                            {insurer.phone}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Timestamps</p>
                                    <div className="mt-1 space-y-2">
                                        <p className="flex items-center gap-2">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                            Created: {format(new Date(insurer.createdAt), "MMM d, yyyy")}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                                            Updated: {format(new Date(insurer.updatedAt), "MMM d, yyyy")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
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
    const [deletingInsurerId, setDeletingInsurerId] = useState<string | null>(
        null
    );

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

    const validateForm = (data: typeof formData): boolean => {
        const errors = {
            name: "",
            email: "",
            phone: "",
        };
        let isValid = true;

        if (!data.name.trim()) {
            errors.name = "Name is required";
            isValid = false;
        }

        if (!data.email.trim()) {
            errors.email = "Email is required";
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = "Invalid email format";
            isValid = false;
        }

        if (!data.phone.trim()) {
            errors.phone = "Phone is required";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleEditOpen = (insurer: Insurer) => {
        setEditingInsurer(insurer);
        setFormData({
            name: insurer.name,
            email: insurer.email,
            phone: insurer.phone,
        });
        setIsEditing(true);
    };

    const handleEditSubmit = async () => {
        if (!validateForm(formData) || !editingInsurer) return;

        setIsSaving(true);
        try {
            const response = await fetch(`/api/insurers/${editingInsurer.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Failed to update insurer");

            toast({
                title: "Success",
                description: "Insurer updated successfully",
            });

            setIsEditing(false);
            fetchInsurers();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update insurer",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddNewOpen = () => {
        setNewInsurerData({
            name: "",
            email: "",
            phone: "",
        });
        setNewInsurerErrors({
            name: "",
            email: "",
            phone: "",
        });
        setIsAddingNew(true);
    };

    const handleAddNewSubmit = async () => {
        if (!validateForm(newInsurerData)) return;

        setIsSaving(true);
        try {
            const response = await fetch("/api/insurers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newInsurerData),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || "Failed to create insurer");
            }

            const data = await response.json();
            toast({
                title: "Success",
                description: "Insurer created successfully",
            });

            setIsAddingNew(false);
            setNewInsurerData({
                name: "",
                email: "",
                phone: "",
            });
            fetchInsurers();
        } catch (error) {
            console.error("Error creating insurer:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create insurer",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteOpen = (id: string) => {
        setDeletingInsurerId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteSubmit = async () => {
        if (!deletingInsurerId) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/insurers/${deletingInsurerId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete insurer");

            toast({
                title: "Success",
                description: "Insurer deleted successfully",
            });

            setIsDeleteDialogOpen(false);
            if (selectedInsurer?.id === deletingInsurerId) {
                setSelectedInsurer(null);
            }
            fetchInsurers();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete insurer",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter and sort insurers
    const filteredInsurers = useMemo(() => {
        return insurers
            .filter(
                (insurer) =>
                    insurer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    insurer.email.toLowerCase().includes(searchTerm.toLowerCase())
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

    const handleRowClick = (insurer: Insurer) => {
        setSelectedInsurer(selectedInsurer?.id === insurer.id ? null : insurer);
    };

    return (
        <Card className="p-6">
            <p className="text-sm text-muted-foreground">
                Manage insurance companies in the system
            </p>

            <div className="mt-6 flex items-center gap-4">
                <div className="flex-1 flex items-center gap-4">
                    <div className="relative w-[280px] bg-muted/50 rounded-full">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
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
                        onClick={() =>
                            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                        }
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
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => setIsAddingNew(true)}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Add Insurer</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            <div className="mt-4 rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="text-xs font-medium">Name</TableHead>
                            <TableHead className="text-xs font-medium">Email</TableHead>
                            <TableHead className="text-xs font-medium">Phone</TableHead>
                            <TableHead className="text-xs font-medium">Status</TableHead>
                            <TableHead className="w-[80px] text-xs font-medium">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isFetching ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : paginatedInsurers.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="h-24 text-center text-sm text-muted-foreground"
                                >
                                    No insurers found
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedInsurers.map((insurer) => (
                                <TableRow key={insurer.id} className="hover:bg-muted/50">
                                    <TableCell className="py-2.5 text-sm font-medium">
                                        {insurer.name}
                                    </TableCell>
                                    <TableCell className="py-2.5 text-sm">
                                        {insurer.email}
                                    </TableCell>
                                    <TableCell className="py-2.5 text-sm">
                                        {insurer.phone}
                                    </TableCell>
                                    <TableCell className="py-2.5">
                                        <Badge
                                            variant={insurer.isActive ? "default" : "secondary"}
                                            className="text-xs font-medium"
                                        >
                                            {insurer.isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-2.5">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[160px]">
                                                <DropdownMenuLabel className="text-xs">
                                                    Actions
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-xs cursor-pointer"
                                                    onClick={() => setIsEditing(true)}
                                                >
                                                    <Edit2 className="h-3.5 w-3.5 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-xs text-destructive cursor-pointer"
                                                    onClick={() => setIsDeleteDialogOpen(true)}
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
                    <p className="text-xs text-muted-foreground">
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
                            className="h-7 w-7 rounded-full"
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>
                        <p className="text-xs">
                            Page {currentPage + 1} of{" "}
                            {Math.max(1, Math.ceil(filteredInsurers.length / ITEMS_PER_PAGE))}
                        </p>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-full"
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

            <AnimatePresence>
                {selectedInsurer && (
                    <InsurerDetail
                        insurer={selectedInsurer}
                        onClose={() => setSelectedInsurer(null)}
                    />
                )}
            </AnimatePresence>

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
                                className="h-7 text-sm"
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
                                className="h-7 text-xs"
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
                                className="h-7 text-xs"
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
                        <DialogTitle>Delete Insurer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-5 w-5" />
                            <p>Are you sure you want to delete this insurer?</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            This action cannot be undone.
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

variant = "destructive"
className = "h-9 text-xs"
onClick = {() => handleDeleteSubmit()}
disabled = { isDeleting }
    >
{
    isDeleting?(
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
              </Button >
            </div >
          </div >
        </DialogContent >
      </Dialog >
    </Card >
  );
}
