"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
    Sticker,
    SearchIcon,
    MoreHorizontal,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";
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

interface StickerType {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
    deletedAt: Date | null;
    _count?: {
        stickers: number;
        stickerStocks: number;
    };
}

// Add constants for pagination
const ITEMS_PER_PAGE = 10;

export default function StickerSettingsPage() {
    const { toast } = useToast();
    const [entities, setEntities] = useState<StickerType[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [selectedEntity, setSelectedEntity] = useState<StickerType | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editingEntity, setEditingEntity] = useState<StickerType | null>(null);
    const [entityName, setEntityName] = useState("");
    const [entityDescription, setEntityDescription] = useState("");
    const [nameError, setNameError] = useState("");

    // Add new state
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newEntityName, setNewEntityName] = useState("");
    const [newEntityDescription, setNewEntityDescription] = useState("");
    const [newNameError, setNewNameError] = useState("");

    // Delete state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingEntityId, setDeletingEntityId] = useState<string | null>(null);

    const fetchEntities = async () => {
        try {
            setIsFetching(true);
            const response = await fetch("/api/sticker-types");
            if (!response.ok) throw new Error("Failed to fetch sticker types");
            const data = await response.json();
            setEntities(data);
        } catch (error) {
            console.error("Error fetching sticker types:", error);
            toast({
                title: "Error",
                description: "Failed to load sticker types",
                variant: "destructive",
            });
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchEntities();
    }, []);

    const handleEditOpen = (entity: StickerType) => {
        setEditingEntity(entity);
        setEntityName(entity.name);
        setEntityDescription(entity.description || "");
        setNameError("");
        setIsEditing(true);
    };

    const handleEditSubmit = async () => {
        if (!editingEntity) return;

        try {
            setIsSaving(true);
            const response = await fetch(`/api/sticker-types/${editingEntity.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: entityName.trim(),
                    description: entityDescription.trim() || null,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                if (error.code === "P2002") {
                    setNameError("A sticker type with this name already exists");
                    return;
                }
                throw new Error("Failed to update sticker type");
            }

            await fetchEntities();
            setIsEditing(false);
            toast({
                title: "Success",
                description: "Sticker type updated successfully",
            });
        } catch (error) {
            console.error("Error updating sticker type:", error);
            toast({
                title: "Error",
                description: "Failed to update sticker type",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddNew = async () => {
        try {
            setIsSaving(true);
            const response = await fetch("/api/sticker-types", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newEntityName.trim(),
                    description: newEntityDescription.trim() || null,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                if (error.code === "P2002") {
                    setNewNameError("A sticker type with this name already exists");
                    return;
                }
                throw new Error("Failed to create sticker type");
            }

            await fetchEntities();
            setIsAddingNew(false);
            setNewEntityName("");
            setNewEntityDescription("");
            toast({
                title: "Success",
                description: "Sticker type created successfully",
            });
        } catch (error) {
            console.error("Error creating sticker type:", error);
            toast({
                title: "Error",
                description: "Failed to create sticker type",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteOpen = (id: string) => {
        setDeletingEntityId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingEntityId) return;

        try {
            setIsDeleting(true);
            const response = await fetch(`/api/sticker-types/${deletingEntityId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete sticker type");

            await fetchEntities();
            setIsDeleteDialogOpen(false);
            setDeletingEntityId(null);
            setSelectedEntity(null);
            toast({
                title: "Success",
                description: "Sticker type deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting sticker type:", error);
            toast({
                title: "Error",
                description: "Failed to delete sticker type",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter and sort entities
    const filteredEntities = entities
        .filter((entity) =>
            entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (entity.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const compareValue = sortDirection === "asc"
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
            return compareValue;
        });

    // Calculate pagination
    const paginatedEntities = filteredEntities.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    // Update total pages whenever filtered entities change
    useEffect(() => {
        setTotalPages(Math.ceil(filteredEntities.length / ITEMS_PER_PAGE));
        if (currentPage >= Math.ceil(filteredEntities.length / ITEMS_PER_PAGE)) {
            setCurrentPage(0);
        }
    }, [filteredEntities, currentPage]);

    return (
        <div className="space-y-6 px-1 sm:px-2 md:px-0">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">Sticker Types</CardTitle>
                        <CardDescription>
                            Manage sticker types used throughout the system
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="relative flex-1 sm:w-[280px] w-full max-w-full sm:max-w-[280px] flex items-center gap-2">
                                <div className="relative flex-1">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-500" />
                                    <Input
                                        placeholder="Search sticker types..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 h-9 text-xs border-0 bg-muted/50 hover:bg-muted focus:bg-background rounded-full"
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
                                        <ChevronUp className="h-3 w-3 ml-1 text-blue-500" />
                                    ) : (
                                        <ChevronDown className="h-3 w-3 ml-1 text-blue-500" />
                                    )}
                                </Button>
                                <Button
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => {
                                        setNewEntityName("");
                                        setNewEntityDescription("");
                                        setNewNameError("");
                                        setIsAddingNew(true);
                                    }}
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            <div className={cn(
                                "transition-all duration-200 rounded-md border",
                                selectedEntity ? "lg:col-span-7 md:col-span-6 col-span-12" : "col-span-12"
                            )}>
                                <Table className="text-xs">
                                    <TableHeader className="bg-blue-50/70 dark:bg-blue-950/20">
                                        <TableRow>
                                            <TableHead className="text-xs font-medium py-1 h-6 border-b border-border/40 px-2">Name</TableHead>
                                            <TableHead className="text-xs font-medium py-1 h-6 border-b border-border/40 px-2">Description</TableHead>
                                            <TableHead className="text-xs font-medium py-1 h-6 border-b border-border/40 px-2 text-right w-[60px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isFetching ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-[200px] text-center">
                                                    <div className="flex flex-col items-center justify-center h-full">
                                                        <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-500" />
                                                        <p className="text-sm text-muted-foreground">Loading sticker types...</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : paginatedEntities.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-[200px] text-center">
                                                    <div className="flex flex-col items-center justify-center h-full">
                                                        <AlertCircle className="h-8 w-8 mb-2 text-muted-foreground" />
                                                        <p className="text-sm text-muted-foreground">No sticker types found</p>
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
                                            paginatedEntities.map((entity) => (
                                                <TableRow
                                                    key={entity.id}
                                                    className={cn(
                                                        "cursor-pointer hover:bg-muted/50",
                                                        selectedEntity?.id === entity.id && "bg-blue-50/70 dark:bg-blue-950/20"
                                                    )}
                                                    onClick={() => setSelectedEntity(entity.id === selectedEntity?.id ? null : entity)}
                                                >
                                                    <TableCell className="py-1 px-2 h-7 text-xs font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <Sticker className="h-3.5 w-3.5 text-blue-500" />
                                                            {entity.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-1 px-2 h-7 text-xs text-muted-foreground">
                                                        {entity.description || "No description"}
                                                    </TableCell>
                                                    <TableCell className="py-1 px-2 h-7 text-xs text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 hover:bg-muted"
                                                                >
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
                                                                        handleEditOpen(entity);
                                                                    }}
                                                                >
                                                                    <Edit2 className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-xs text-red-600"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteOpen(entity.id);
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
                                {filteredEntities.length > 0 && (
                                    <div className="flex items-center justify-between px-2 py-2 border-t border-border/40">
                                        <div className="text-xs text-muted-foreground">
                                            Showing {Math.min(filteredEntities.length, currentPage * ITEMS_PER_PAGE + 1)} to {Math.min(filteredEntities.length, (currentPage + 1) * ITEMS_PER_PAGE)} of {filteredEntities.length} types
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
                            {selectedEntity && (
                                <div className="lg:col-span-5 md:col-span-6 col-span-12">
                                    <Card>
                                        <CardHeader className="pb-4">
                                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                                <Sticker className="h-4 w-4 text-blue-500" />
                                                Sticker Type Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-medium text-muted-foreground">Name</Label>
                                                <div className="text-sm">{selectedEntity.name}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-medium text-muted-foreground">Description</Label>
                                                <div className="text-sm">{selectedEntity.description || "No description"}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-medium text-muted-foreground">Usage</Label>
                                                <div className="text-sm">
                                                    {selectedEntity._count?.stickers || 0} sticker(s) using this type
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2 border-t">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs rounded-full"
                                                    onClick={() => handleEditOpen(selectedEntity)}
                                                >
                                                    <Edit2 className="h-3 w-3 mr-1 text-blue-500" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="h-7 text-xs rounded-full"
                                                    onClick={() => handleDeleteOpen(selectedEntity.id)}
                                                    disabled={selectedEntity._count?.stickers ? selectedEntity._count.stickers > 0 : false}
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sticker className="h-4 w-4 text-blue-500" />
                            Edit Sticker Type
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label className="text-xs">Name</Label>
                            <Input
                                value={entityName}
                                onChange={(e) => {
                                    setEntityName(e.target.value);
                                    setNameError("");
                                }}
                                placeholder="Enter sticker type name"
                                className={`h-8 text-xs ${nameError ? 'border-red-500 focus:border-red-500' : ''}`}
                            />
                            {nameError && (
                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    {nameError}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Description (Optional)</Label>
                            <Textarea
                                value={entityDescription}
                                onChange={(e) => setEntityDescription(e.target.value)}
                                placeholder="Enter description"
                                className="min-h-[100px] text-xs resize-y"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                                disabled={isSaving}
                                className="h-8 text-xs rounded-full"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleEditSubmit}
                                disabled={isSaving || !entityName.trim()}
                                className="h-8 text-xs rounded-full"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-3 w-3 mr-1" />
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
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sticker className="h-4 w-4 text-blue-500" />
                            Add New Sticker Type
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label className="text-xs">Name</Label>
                            <Input
                                value={newEntityName}
                                onChange={(e) => {
                                    setNewEntityName(e.target.value);
                                    setNewNameError("");
                                }}
                                placeholder="Enter sticker type name"
                                className={`h-8 text-xs ${newNameError ? 'border-red-500 focus:border-red-500' : ''}`}
                            />
                            {newNameError && (
                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    {newNameError}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Description (Optional)</Label>
                            <Textarea
                                value={newEntityDescription}
                                onChange={(e) => setNewEntityDescription(e.target.value)}
                                placeholder="Enter description"
                                className="min-h-[100px] text-xs resize-y"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsAddingNew(false)}
                                disabled={isSaving}
                                className="h-8 text-xs rounded-full"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddNew}
                                disabled={isSaving || !newEntityName.trim()}
                                className="h-8 text-xs rounded-full"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-3 w-3 mr-1" />
                                        Create
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Delete Sticker Type
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm">
                            Are you sure you want to delete this sticker type? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                className="h-8 text-xs rounded-full"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                className="h-8 text-xs rounded-full"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-3 w-3 mr-1" />
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