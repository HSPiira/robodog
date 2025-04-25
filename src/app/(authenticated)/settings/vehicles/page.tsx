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
import { Textarea } from "@/components/ui/textarea";

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
    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
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
    const [nameError, setNameError] = useState("");

    // Add new state
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newEntityName, setNewEntityName] = useState("");
    const [newEntityDescription, setNewEntityDescription] = useState("");
    const [newNameError, setNewNameError] = useState("");

    // Delete state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingEntityId, setDeletingEntityId] = useState<string | null>(null);

    // API endpoints mapping
    const apiEndpoints = {
        vehicleTypes: "/api/vehicle-types",
        bodyTypes: "/api/body-types",
        vehicleCategories: "/api/vehicle-categories",
    };

    // Tab labels with color definitions
    const tabLabels = {
        vehicleTypes: {
            title: "Vehicle Types",
            description: "Types of vehicles in the system",
            icon: Car,
            color: "text-blue-500",
            bgColor: "bg-blue-50/70 dark:bg-blue-950/20",
            accentColor: "bg-blue-500",
            hoverColor: "hover:text-blue-600 hover:bg-blue-50",
            activeText: "text-blue-700 dark:text-blue-300",
        },
        bodyTypes: {
            title: "Body Types",
            description: "Physical body types of vehicles",
            icon: Truck,
            color: "text-emerald-500",
            bgColor: "bg-emerald-50/70 dark:bg-emerald-950/20",
            accentColor: "bg-emerald-500",
            hoverColor: "hover:text-emerald-600 hover:bg-emerald-50",
            activeText: "text-emerald-700 dark:text-emerald-300",
        },
        vehicleCategories: {
            title: "Vehicle Categories",
            description: "Categories for classifying vehicles",
            icon: Tag,
            color: "text-amber-500",
            bgColor: "bg-amber-50/70 dark:bg-amber-950/20",
            accentColor: "bg-amber-500",
            hoverColor: "hover:text-amber-600 hover:bg-amber-50",
            activeText: "text-amber-700 dark:text-amber-300",
        },
    };

    // Helper function to get singular form of entity types
    const getSingularForm = (type: EntityType): string => {
        const singularForms = {
            vehicleTypes: "Vehicle Type",
            bodyTypes: "Body Type",
            vehicleCategories: "Vehicle Category",
        };
        return singularForms[type];
    };

    useEffect(() => {
        fetchEntities();
    }, [activeTab]);

    const fetchEntities = async () => {
        setIsFetching(true);
        try {
            const response = await fetch(`${apiEndpoints[activeTab]}?include=stats`);
            const data = await response.json();
            setEntities(data);

            // If an entity is selected, refresh it with the latest data
            if (selectedEntity) {
                const updatedSelectedEntity = data.find((entity: VehicleEntity) => entity.id === selectedEntity.id);
                if (updatedSelectedEntity) {
                    setSelectedEntity(updatedSelectedEntity);
                }
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch data",
                variant: "destructive",
            });
        } finally {
            setIsFetching(false);
        }
    };

    const handleEditOpen = (entity: VehicleEntity) => {
        setEditingEntity(entity);
        setEntityName(entity.name);
        setEntityDescription(entity.description || "");
        setNameError("");
        setIsEditing(true);
    };

    const validateEntityName = (name: string, currentId?: string): boolean => {
        const normalizedName = name.trim().replace(/\s+/g, ' ');

        if (!normalizedName) {
            return false;
        }

        // Check for duplicates, excluding the current entity if editing
        const duplicate = entities.find(
            entity => entity.name.toLowerCase().trim().replace(/\s+/g, ' ') === normalizedName.toLowerCase() && entity.id !== currentId
        );

        return !duplicate;
    };

    const handleEditSubmit = async () => {
        if (!editingEntity || !entityName.trim()) return;

        // Check for duplicate names
        if (!validateEntityName(entityName, editingEntity.id)) {
            setNameError(`A ${getSingularForm(activeTab).toLowerCase()} with this name already exists`);
            return;
        }

        setIsSaving(true);
        setNameError("");
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
                const errorData = await response.json();
                if (errorData.error === "DUPLICATE_NAME") {
                    setNameError(`A ${getSingularForm(activeTab).toLowerCase()} with this name already exists`);
                    setIsSaving(false);
                    return;
                }
                throw new Error(errorData.message || "Failed to update");
            }

            toast({
                title: "Updated Successfully",
                description: `${getSingularForm(activeTab).toLowerCase()} has been updated`,
            });

            // Fetch updated data and update selected entity
            await fetchEntities();

            // If the edited entity is currently selected, refresh it
            if (selectedEntity && selectedEntity.id === editingEntity.id) {
                const updatedEntity = await fetch(`${apiEndpoints[activeTab]}/${editingEntity.id}?include=stats`).then(res => res.json());
                setSelectedEntity(updatedEntity);
            }

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

    const handleAddNewOpen = () => {
        setNewEntityName("");
        setNewEntityDescription("");
        setNewNameError("");
        setIsAddingNew(true);
    };

    const handleAddNewSubmit = async () => {
        if (!newEntityName.trim()) return;

        // Check for duplicate names
        if (!validateEntityName(newEntityName)) {
            setNewNameError(`A ${getSingularForm(activeTab).toLowerCase()} with this name already exists`);
            return;
        }

        setIsSaving(true);
        setNewNameError("");
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
                const errorData = await response.json();
                if (errorData.error === "DUPLICATE_NAME") {
                    setNewNameError(`A ${getSingularForm(activeTab).toLowerCase()} with this name already exists`);
                    setIsSaving(false);
                    return;
                }
                throw new Error(errorData.message || "Failed to create");
            }

            // Get the newly created entity
            const newEntity = await response.json();

            toast({
                title: "Created Successfully",
                description: `New ${getSingularForm(activeTab).toLowerCase()} has been created`,
            });

            // Fetch updated data
            await fetchEntities();

            // Select the newly created entity
            if (newEntity && newEntity.id) {
                const fullEntity = await fetch(`${apiEndpoints[activeTab]}/${newEntity.id}?include=stats`).then(res => res.json());
                setSelectedEntity(fullEntity);
            }

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

    const handleDeleteOpen = (id: string) => {
        setDeletingEntityId(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteSubmit = async () => {
        if (!deletingEntityId) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`${apiEndpoints[activeTab]}/${deletingEntityId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete");
            }

            toast({
                title: "Deleted Successfully",
                description: `The ${getSingularForm(activeTab).toLowerCase()} has been deleted`,
            });

            // Clear selected entity if it was deleted
            if (selectedEntity && selectedEntity.id === deletingEntityId) {
                setSelectedEntity(null);
            }

            await fetchEntities();
            setIsDeleteDialogOpen(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
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
                        <CardDescription>
                            Manage vehicle types, body types, and categories used throughout the system
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <Tabs
                        defaultValue="vehicleTypes"
                        value={activeTab}
                        onValueChange={(value) => {
                            setActiveTab(value as EntityType);
                            setSelectedEntity(null); // Clear selection when changing tabs
                        }}
                        className="space-y-0"
                    >
                        <div className="w-[420px] mb-4">
                            <TabsList className="grid grid-cols-3 p-0 bg-transparent h-9">
                                <TabsTrigger
                                    value="vehicleTypes"
                                    className="rounded-full data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground"
                                >
                                    <div className="flex items-center space-x-1.5">
                                        <Car className="h-3.5 w-3.5" />
                                        <span className="text-xs font-medium">Vehicle Types</span>
                                    </div>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="bodyTypes"
                                    className="rounded-full data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground"
                                >
                                    <div className="flex items-center space-x-1.5">
                                        <Truck className="h-3.5 w-3.5" />
                                        <span className="text-xs font-medium">Body Types</span>
                                    </div>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="vehicleCategories"
                                    className="rounded-full data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground"
                                >
                                    <div className="flex items-center space-x-1.5">
                                        <Tag className="h-3.5 w-3.5" />
                                        <span className="text-xs font-medium">Categories</span>
                                    </div>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Content for all tabs - same UI with different data */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                                <div className="relative flex-1 sm:w-[250px] w-full max-w-full sm:max-w-[250px]">
                                    <SearchIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 ${tabLabels[activeTab].color}`} />
                                    <input
                                        className="w-full h-9 rounded-full pl-9 pr-4 text-xs bg-muted/50 hover:bg-muted focus:bg-background border border-transparent focus:border-input focus:ring-0 focus:ring-offset-0 outline-none transition-all"
                                        placeholder={`Search ${tabLabels[activeTab].title.toLowerCase()}...`}
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
                                            <ChevronUp className={`h-3 w-3 ml-1 ${tabLabels[activeTab].color}`} />
                                        ) : (
                                            <ChevronDown className={`h-3 w-3 ml-1 ${tabLabels[activeTab].color}`} />
                                        )}
                                    </Button>
                                    <Button
                                        size="icon"
                                        onClick={handleAddNewOpen}
                                        className="h-8 w-8 rounded-full"
                                        variant="outline"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span className="sr-only">Add New</span>
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-12 gap-4">
                                {/* Table section - left side */}
                                <div className={`${selectedEntity ? 'lg:col-span-7 md:col-span-6 col-span-12' : 'col-span-12'} transition-all duration-200 rounded-md border`}>
                                    <Table className="text-xs">
                                        <TableHeader className={`${tabLabels[activeTab].bgColor}`}>
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
                                                            <Loader2 className={`h-8 w-8 animate-spin mb-2 ${tabLabels[activeTab].color}`} />
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
                                                                    className={`mt-2 ${tabLabels[activeTab].color}`}
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
                                                        className={`hover:${tabLabels[activeTab].bgColor} cursor-pointer ${selectedEntity?.id === entity.id ? tabLabels[activeTab].bgColor : ''}`}
                                                        onClick={() => handleRowClick(entity)}
                                                    >
                                                        <TableCell className="py-1 px-2 h-7 text-xs font-medium whitespace-nowrap">
                                                            <div className="flex items-center gap-2 max-w-[180px]">
                                                                <TabIcon className={`h-3.5 w-3.5 ${tabLabels[activeTab].color} flex-shrink-0`} />
                                                                <span className="truncate">{entity.name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-1 px-2 h-7 text-xs text-muted-foreground">
                                                            <div className={`${selectedEntity ? 'max-w-[220px]' : 'max-w-[600px]'} truncate whitespace-nowrap transition-all duration-200`}>
                                                                {entity.description || "—"}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-1 px-2 h-7 text-right w-[50px]">
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
                                                                        <Edit2 className={`h-3.5 w-3.5 mr-2 ${tabLabels[activeTab].color}`} /> Edit
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
                                                    <ChevronLeft className={`h-3.5 w-3.5 ${currentPage === 0 ? 'text-muted-foreground' : tabLabels[activeTab].color}`} />
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
                                                    <ChevronRight className={`h-3.5 w-3.5 ${currentPage >= totalPages - 1 ? 'text-muted-foreground' : tabLabels[activeTab].color}`} />
                                                    <span className="sr-only">Next</span>
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Details Card - right side */}
                                {selectedEntity && (
                                    <div className="lg:col-span-5 md:col-span-6 col-span-12 transition-all duration-200">
                                        <Card className="h-full">
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <CardTitle className="text-sm flex items-center gap-2">
                                                        <TabIcon className={`h-4 w-4 ${tabLabels[activeTab].color}`} />
                                                        {selectedEntity.name}
                                                    </CardTitle>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 w-7 p-0 rounded-full"
                                                        onClick={() => setSelectedEntity(null)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <Badge variant="outline" className={`mt-1 text-[10px] py-0 px-2 h-4 w-fit ${tabLabels[activeTab].color} bg-muted/50`}>
                                                    {getSingularForm(activeTab)}
                                                </Badge>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <div className="space-y-4 text-xs">
                                                    <div>
                                                        <h4 className={`font-semibold text-muted-foreground`}>Description</h4>
                                                        <p className="mt-1">{selectedEntity.description || "No description provided"}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-semibold text-muted-foreground`}>ID</h4>
                                                        <p className={`font-mono text-[10px] ${tabLabels[activeTab].bgColor} p-1 rounded mt-1`}>{selectedEntity.id}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className={`font-semibold text-muted-foreground`}>Created</h4>
                                                            <p className="mt-1">{selectedEntity.createdAt
                                                                ? new Date(selectedEntity.createdAt).toLocaleDateString()
                                                                : "Unknown"}</p>
                                                        </div>
                                                        <div>
                                                            <h4 className={`font-semibold text-muted-foreground`}>Last Updated</h4>
                                                            <p className="mt-1">{selectedEntity.updatedAt
                                                                ? new Date(selectedEntity.updatedAt).toLocaleDateString()
                                                                : "Unknown"}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-semibold text-muted-foreground`}>Usage</h4>
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
                                                            className="h-7 text-xs rounded-full"
                                                            onClick={() => handleEditOpen(selectedEntity)}
                                                        >
                                                            <Edit2 className={`h-3 w-3 mr-1 ${tabLabels[activeTab].color}`} /> Edit
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-7 text-xs rounded-full"
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
                <DialogContent className="rounded-lg max-h-[90vh]">
                    <DialogHeader className="pb-2">
                        <DialogTitle className="flex items-center gap-2">
                            <TabIcon className={`h-4 w-4 ${tabLabels[activeTab].color}`} />
                            Edit {getSingularForm(activeTab)}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                        <div className="space-y-3">
                            <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                            <Input
                                id="name"
                                value={entityName}
                                onChange={(e) => {
                                    setEntityName(e.target.value);
                                    setNameError("");
                                }}
                                placeholder={`Enter ${tabLabels[activeTab].title.toLowerCase()} name`}
                                className={`rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 h-9 ${nameError ? 'border-red-500 focus:border-red-500' : ''}`}
                            />
                            {nameError && (
                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    {nameError}
                                </p>
                            )}
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                value={entityDescription}
                                onChange={(e) => setEntityDescription(e.target.value)}
                                placeholder="Enter description"
                                className="rounded-md min-h-[120px] text-xs resize-y focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving} className="rounded-full h-6 text-xs px-3">
                                Cancel
                            </Button>
                            <Button onClick={handleEditSubmit} disabled={isSaving || !entityName.trim()} className="rounded-full h-6 text-xs px-3">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className={`h-3 w-3 mr-1 ${tabLabels[activeTab].color}`} />
                                        Save
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add New Dialog */}
            <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
                <DialogContent className="rounded-lg max-h-[90vh]">
                    <DialogHeader className="pb-2">
                        <DialogTitle className="flex items-center gap-2">
                            <TabIcon className={`h-4 w-4 ${tabLabels[activeTab].color}`} />
                            Add New {getSingularForm(activeTab)}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                        <div className="space-y-3">
                            <Label htmlFor="new-name" className="text-sm font-medium">Name</Label>
                            <Input
                                id="new-name"
                                value={newEntityName}
                                onChange={(e) => {
                                    setNewEntityName(e.target.value);
                                    setNewNameError("");
                                }}
                                placeholder={`Enter ${tabLabels[activeTab].title.toLowerCase()} name`}
                                className={`rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 h-9 ${newNameError ? 'border-red-500 focus:border-red-500' : ''}`}
                            />
                            {newNameError && (
                                <p className="text-red-500 text-xs mt-1 flex items-center">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    {newNameError}
                                </p>
                            )}
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="new-description" className="text-sm font-medium">Description (Optional)</Label>
                            <Textarea
                                id="new-description"
                                value={newEntityDescription}
                                onChange={(e) => setNewEntityDescription(e.target.value)}
                                placeholder="Enter description"
                                className="rounded-md min-h-[120px] text-xs resize-y focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setIsAddingNew(false)} disabled={isSaving} className="rounded-full h-6 text-xs px-3">
                                Cancel
                            </Button>
                            <Button onClick={handleAddNewSubmit} disabled={isSaving || !newEntityName.trim()} className="rounded-full h-6 text-xs px-3">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className={`h-3 w-3 mr-1 ${tabLabels[activeTab].color}`} />
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
                <DialogContent className="rounded-lg">
                    <DialogHeader className="pb-2">
                        <DialogTitle className="flex items-center gap-2 text-red-500">
                            <Trash2 className="h-4 w-4" />
                            Confirm Deletion
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 pt-4">
                        <p className="text-sm">
                            Are you sure you want to delete this {getSingularForm(activeTab).toLowerCase()}?
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting} className="rounded-full h-6 text-xs px-3">
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={isDeleting} className="rounded-full h-6 text-xs px-3">
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