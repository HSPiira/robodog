"use client";

import { useState, useEffect, useMemo } from "react";
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
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
    X,
    Car,
    Truck,
    Tag,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

interface VehicleEntity {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    _count?: {
        vehicles?: number;
    };
}

type EntityType = "vehicleTypes" | "bodyTypes" | "vehicleCategories";

// Add constants for pagination
const ITEMS_PER_PAGE = 10;

export default function VehicleSettingsPage() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<EntityType>("vehicleTypes");
    const [entities, setEntities] = useState<VehicleEntity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [selectedEntity, setSelectedEntity] = useState<VehicleEntity | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editingEntity, setEditingEntity] = useState<VehicleEntity | null>(null);
    const [entityName, setEntityName] = useState("");
    const [entityDescription, setEntityDescription] = useState("");

    // Add new state
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newEntityName, setNewEntityName] = useState("");
    const [newEntityDescription, setNewEntityDescription] = useState("");

    // Delete state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingEntityId, setDeletingEntityId] = useState<string | null>(null);

    // API endpoints mapping
    const apiEndpoints = {
        vehicleTypes: "/api/vehicle-types",
        bodyTypes: "/api/body-types",
        vehicleCategories: "/api/vehicle-categories",
    };

    // Tab labels
    const tabLabels = {
        vehicleTypes: {
            title: "Vehicle Types",
            description: "Types of vehicles in the system",
            icon: Car,
        },
        bodyTypes: {
            title: "Body Types",
            description: "Physical body types of vehicles",
            icon: Truck,
        },
        vehicleCategories: {
            title: "Vehicle Categories",
            description: "Categories for classifying vehicles",
            icon: Tag,
        },
    };

    useEffect(() => {
        fetchEntities();
    }, [activeTab]);

    const fetchEntities = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${apiEndpoints[activeTab]}?include=stats`);
            const data = await response.json();
            setEntities(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch data",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditOpen = (entity: VehicleEntity) => {
        setEditingEntity(entity);
        setEntityName(entity.name);
        setEntityDescription(entity.description || "");
        setIsEditing(true);
    };

    const handleEditSubmit = async () => {
        if (!editingEntity || !entityName.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${apiEndpoints[activeTab]}/${editingEntity.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: entityName.trim(),
                    description: entityDescription.trim() || null,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update");
            }

            toast({
                title: "Updated Successfully",
                description: `${tabLabels[activeTab].title.slice(0, -1)} has been updated`,
            });

            fetchEntities();
            setIsEditing(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNewOpen = () => {
        setNewEntityName("");
        setNewEntityDescription("");
        setIsAddingNew(true);
    };

    const handleAddNewSubmit = async () => {
        if (!newEntityName.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(apiEndpoints[activeTab], {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newEntityName.trim(),
                    description: newEntityDescription.trim() || null,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create");
            }

            toast({
                title: "Created Successfully",
                description: `New ${tabLabels[activeTab].title.slice(0, -1).toLowerCase()} has been created`,
            });

            fetchEntities();
            setIsAddingNew(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteOpen = (id: string) => {
        setDeletingEntityId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteSubmit = async () => {
        if (!deletingEntityId) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${apiEndpoints[activeTab]}/${deletingEntityId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete");
            }

            toast({
                title: "Deleted Successfully",
                description: `The ${tabLabels[activeTab].title.slice(0, -1).toLowerCase()} has been deleted`,
            });

            fetchEntities();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setDeletingEntityId(null);
        }
    };

    // Filter and sort entities based on search term and sort direction
    const filteredEntities = entities
        .filter(entity =>
            entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (entity.description && entity.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            if (sortDirection === "asc") {
                return a.name.localeCompare(b.name);
            } else {
                return b.name.localeCompare(a.name);
            }
        });

    // Calculate pagination
    const paginatedEntities = useMemo(() => {
        const startIndex = currentPage * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredEntities.slice(startIndex, endIndex);
    }, [filteredEntities, currentPage]);

    // Update total pages whenever filtered entities change
    useEffect(() => {
        setTotalPages(Math.ceil(filteredEntities.length / ITEMS_PER_PAGE));
        // Reset to first page if current page is out of bounds
        if (currentPage >= Math.ceil(filteredEntities.length / ITEMS_PER_PAGE)) {
            setCurrentPage(0);
        }
    }, [filteredEntities, currentPage]);

    // Reset pagination when changing tabs
    useEffect(() => {
        setCurrentPage(0);
    }, [activeTab]);

    // Handle page navigation
    const goToNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const TabIcon = tabLabels[activeTab].icon;

    // Add a function to handle row click/selection
    const handleRowClick = (entity: VehicleEntity) => {
        setSelectedEntity(entity.id === selectedEntity?.id ? null : entity);
    };

    return (
        <div className="space-y-6 px-1 sm:px-2 md:px-0">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Car className="h-5 w-5 text-primary" />
                            <CardTitle>Vehicle Settings</CardTitle>
                        </div>
                        <Button size="sm" onClick={handleAddNewOpen} className="gap-1">
                            <Plus className="h-4 w-4" />
                            Add New
                        </Button>
                    </div>
                    <CardDescription>
                        Manage vehicle types, body types, and categories used throughout the system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs
                        defaultValue="vehicleTypes"
                        value={activeTab}
                        onValueChange={(value) => {
                            setActiveTab(value as EntityType);
                            setSelectedEntity(null); // Clear selection when changing tabs
                        }}
                        className="space-y-4"
                    >
                        <TabsList className="grid grid-cols-3 lg:w-[400px] md:w-[350px] w-full">
                            <TabsTrigger value="vehicleTypes" className="flex items-center gap-2">
                                <Car className="h-4 w-4" />
                                <span className="hidden sm:inline">Vehicle Types</span>
                                <span className="sm:hidden">Types</span>
                            </TabsTrigger>
                            <TabsTrigger value="bodyTypes" className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                <span className="hidden sm:inline">Body Types</span>
                                <span className="sm:hidden">Body</span>
                            </TabsTrigger>
                            <TabsTrigger value="vehicleCategories" className="flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                <span className="hidden sm:inline">Categories</span>
                                <span className="sm:hidden">Categories</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* Content for all tabs - same UI with different data */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                                <div className="flex items-center px-2 border rounded-md h-8 w-full sm:w-[250px] text-xs bg-background">
                                    <SearchIcon className="h-3.5 w-3.5 text-muted-foreground mr-2" />
                                    <input
                                        className="flex-1 h-full bg-transparent outline-none"
                                        placeholder={`Search ${tabLabels[activeTab].title.toLowerCase()}...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                                    >
                                        Sort{" "}
                                        {sortDirection === "asc" ? (
                                            <ChevronUp className="h-3 w-3 ml-1" />
                                        ) : (
                                            <ChevronDown className="h-3 w-3 ml-1" />
                                        )}
                                    </Button>
                                    <Badge variant="outline">
                                        {filteredEntities.length} {filteredEntities.length === 1 ? "item" : "items"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-4">
                                {/* Table section - left side */}
                                <div className={`${selectedEntity ? 'lg:col-span-7 md:col-span-6 col-span-12' : 'col-span-12'} transition-all duration-200 rounded-md border`}>
                                    <Table className="text-xs">
                                        <TableHeader className="bg-primary/5">
                                            <TableRow>
                                                <TableHead className="text-xs font-medium py-1 h-6 border-b border-border/40 px-2 w-[160px] sm:w-[200px]">Name</TableHead>
                                                <TableHead className="text-xs font-medium py-1 h-6 border-b border-border/40 px-2">Description</TableHead>
                                                <TableHead className="text-xs font-medium py-1 h-6 border-b border-border/40 px-2 text-right w-[50px] sm:w-[60px]">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="h-[200px] text-center">
                                                        <div className="flex flex-col items-center justify-center h-full">
                                                            <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary/70" />
                                                            <p className="text-sm text-muted-foreground">Loading data...</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredEntities.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="h-[200px] text-center">
                                                        <div className="flex flex-col items-center justify-center h-full">
                                                            <AlertCircle className="h-8 w-8 mb-2 text-muted-foreground" />
                                                            <p className="text-sm text-muted-foreground">No items found</p>
                                                            {searchTerm && (
                                                                <Button
                                                                    variant="link"
                                                                    size="sm"
                                                                    onClick={() => setSearchTerm("")}
                                                                    className="mt-2"
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
                                                        className={`hover:bg-muted/50 cursor-pointer ${selectedEntity?.id === entity.id ? 'bg-muted' : ''}`}
                                                        onClick={() => handleRowClick(entity)}
                                                    >
                                                        <TableCell className="py-1 px-2 h-7 text-xs font-medium whitespace-nowrap">
                                                            <div className="flex items-center gap-2 max-w-[180px]">
                                                                <TabIcon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                                                <span className="truncate">{entity.name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-1 px-2 h-7 text-xs text-muted-foreground">
                                                            <div className={`${selectedEntity ? 'max-w-[220px]' : 'max-w-[600px]'} truncate whitespace-nowrap transition-all duration-200`}>
                                                                {entity.description || "—"}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-1 px-2 h-7 text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-5 w-5 p-0"
                                                                        onClick={(e) => e.stopPropagation()} // Prevent row click when clicking the menu
                                                                    >
                                                                        <span className="sr-only">Open menu</span>
                                                                        <MoreHorizontal className="h-3 w-3" />
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
                                                                        <Edit2 className="h-3.5 w-3.5 mr-2" /> Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="text-xs text-red-600"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteOpen(entity.id);
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
                                    {filteredEntities.length > 0 && (
                                        <div className="flex items-center justify-between px-2 py-2 border-t border-border/40">
                                            <div className="text-xs text-muted-foreground">
                                                Showing {Math.min(filteredEntities.length, currentPage * ITEMS_PER_PAGE + 1)} to {Math.min(filteredEntities.length, (currentPage + 1) * ITEMS_PER_PAGE)} of {filteredEntities.length} items
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={goToPreviousPage}
                                                    disabled={currentPage === 0}
                                                    className="h-7 w-7 rounded-full"
                                                >
                                                    <ChevronLeft className="h-3.5 w-3.5" />
                                                    <span className="sr-only">Previous</span>
                                                </Button>
                                                <div className="text-xs">
                                                    Page {currentPage + 1} of {totalPages || 1}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={goToNextPage}
                                                    disabled={currentPage >= totalPages - 1}
                                                    className="h-7 w-7 rounded-full"
                                                >
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                    <span className="sr-only">Next</span>
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Details Card - right side */}
                                {selectedEntity && (
                                    <div className="lg:col-span-5 md:col-span-6 col-span-12 transition-all duration-200">
                                        <Card className="h-full border-primary/20">
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <CardTitle className="text-sm flex items-center gap-2">
                                                        <TabIcon className="h-4 w-4 text-primary" />
                                                        {selectedEntity.name}
                                                    </CardTitle>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 w-7 p-0"
                                                        onClick={() => setSelectedEntity(null)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <Badge variant="outline" className="mt-1 text-[10px] py-0 px-2 h-4 w-fit">
                                                    {activeTab === "vehicleTypes"
                                                        ? "Vehicle Type"
                                                        : activeTab === "bodyTypes"
                                                            ? "Body Type"
                                                            : "Category"}
                                                </Badge>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <div className="space-y-4 text-xs">
                                                    <div>
                                                        <h4 className="font-semibold text-muted-foreground">Description</h4>
                                                        <p className="mt-1">{selectedEntity.description || "No description provided"}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-muted-foreground">ID</h4>
                                                        <p className="font-mono text-[10px] bg-muted p-1 rounded mt-1">{selectedEntity.id}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="font-semibold text-muted-foreground">Created</h4>
                                                            <p className="mt-1">{selectedEntity.createdAt
                                                                ? new Date(selectedEntity.createdAt).toLocaleDateString()
                                                                : "Unknown"}</p>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-muted-foreground">Last Updated</h4>
                                                            <p className="mt-1">{selectedEntity.updatedAt
                                                                ? new Date(selectedEntity.updatedAt).toLocaleDateString()
                                                                : "Unknown"}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-muted-foreground">Usage</h4>
                                                        <p className="mt-1">
                                                            {selectedEntity._count?.vehicles !== undefined
                                                                ? `Used by ${selectedEntity._count.vehicles} vehicle${selectedEntity._count.vehicles !== 1 ? 's' : ''}`
                                                                : "Usage statistics not available"}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2 pt-2 border-t">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 text-xs"
                                                            onClick={() => handleEditOpen(selectedEntity)}
                                                        >
                                                            <Edit2 className="h-3 w-3 mr-1" /> Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-7 text-xs"
                                                            onClick={() => handleDeleteOpen(selectedEntity.id)}
                                                            disabled={selectedEntity._count?.vehicles ? selectedEntity._count.vehicles > 0 : false}
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
                    </Tabs>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit {tabLabels[activeTab].title.slice(0, -1)}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={entityName}
                                onChange={(e) => setEntityName(e.target.value)}
                                placeholder={`Enter ${tabLabels[activeTab].title.toLowerCase()} name`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Input
                                id="description"
                                value={entityDescription}
                                onChange={(e) => setEntityDescription(e.target.value)}
                                placeholder="Enter description"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button onClick={handleEditSubmit} disabled={isLoading || !entityName.trim()}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
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
                        <DialogTitle>Add New {tabLabels[activeTab].title.slice(0, -1)}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-name">Name</Label>
                            <Input
                                id="new-name"
                                value={newEntityName}
                                onChange={(e) => setNewEntityName(e.target.value)}
                                placeholder={`Enter ${tabLabels[activeTab].title.toLowerCase()} name`}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-description">Description (Optional)</Label>
                            <Input
                                id="new-description"
                                value={newEntityDescription}
                                onChange={(e) => setNewEntityDescription(e.target.value)}
                                placeholder="Enter description"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsAddingNew(false)} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddNewSubmit} disabled={isLoading || !newEntityName.trim()}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create
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
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <p className="text-sm">
                            Are you sure you want to delete this {tabLabels[activeTab].title.slice(0, -1).toLowerCase()}?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2" />
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