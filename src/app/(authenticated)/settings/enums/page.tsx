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
import { Label } from "@/components/ui/label";
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
    ChevronDown,
    ChevronUp,
    MoreHorizontal,
    Database,
    Code,
    SearchIcon,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle,
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
import {
    AllEnums,
    enumCategories,
    isDatabaseEnum,
    getRelatedTables,
    validateEnumValue,
    updateDatabaseEnumValue,
} from "@/lib/services/enums";
import { cn } from "@/lib/utils";

type EnumType = {
    [key: string]: string;
};

// Constants
const ITEMS_PER_PAGE = 10;

export default function EnumsManagementPage() {
    const { toast } = useToast();
    const [selectedGroup, setSelectedGroup] = useState<keyof typeof AllEnums>(Object.keys(AllEnums)[0] as keyof typeof AllEnums);
    const [currentEnum, setCurrentEnum] = useState<EnumType>(AllEnums[Object.keys(AllEnums)[0] as keyof typeof AllEnums]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState(0);
    const [editingEnum, setEditingEnum] = useState<{ key: string; value: string } | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newEnumKey, setNewEnumKey] = useState("");
    const [newEnumValue, setNewEnumValue] = useState("");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingKey, setDeletingKey] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Update current enum when group changes
    useEffect(() => {
        setCurrentEnum(AllEnums[selectedGroup]);
        setCurrentPage(0);
        setSearchTerm("");
        setEditingEnum(null);
    }, [selectedGroup]);

    const isDatabase = isDatabaseEnum(selectedGroup as keyof typeof AllEnums);
    const relatedTables = getRelatedTables(selectedGroup as keyof typeof AllEnums);

    const handleSave = async () => {
        if (!editingEnum) return;

        try {
            // For database enums, validate and update in the database first
            if (isDatabaseEnum(selectedGroup as keyof typeof AllEnums)) {
                const validation = await validateEnumValue(
                    selectedGroup as keyof typeof AllEnums,
                    editingEnum.value
                );

                if (!validation.isValid) {
                    throw new Error(validation.error || "Invalid enum value");
                }

                const result = await updateDatabaseEnumValue(
                    selectedGroup as keyof typeof AllEnums,
                    editingEnum.key,
                    editingEnum.value
                );

                if (!result.success) {
                    throw new Error(result.error || "Failed to update database enum");
                }
            }

            // Update the enum in the application
            const response = await fetch("/api/settings/enums", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    enumGroup: selectedGroup,
                    key: editingEnum.key,
                    value: editingEnum.value,
                }),
            });

            if (!response.ok) throw new Error("Failed to update enum");

            const updatedEnum = { ...currentEnum, [editingEnum.key]: editingEnum.value };
            setCurrentEnum(updatedEnum);
            setEditingEnum(null);

            toast({
                title: "Success",
                description: "Enum value updated successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update enum value",
                variant: "destructive",
            });
        }
    };

    const handleAddNew = async () => {
        if (!selectedGroup || !newEnumKey || !newEnumValue) return;

        try {
            // For database enums, validate first
            if (isDatabaseEnum(selectedGroup as keyof typeof AllEnums)) {
                const validation = await validateEnumValue(
                    selectedGroup as keyof typeof AllEnums,
                    newEnumValue
                );

                if (!validation.isValid) {
                    throw new Error(validation.error || "Invalid enum value");
                }
            }

            const response = await fetch("/api/settings/enums", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    enumGroup: selectedGroup,
                    key: newEnumKey,
                    value: newEnumValue,
                }),
            });

            if (!response.ok) throw new Error("Failed to add enum");

            const updatedEnum = { ...currentEnum, [newEnumKey]: newEnumValue };
            setCurrentEnum(updatedEnum);
            setIsAddingNew(false);
            setNewEnumKey("");
            setNewEnumValue("");

            toast({
                title: "Success",
                description: "New enum value added successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add enum value",
                variant: "destructive",
            });
        }
    };

    const handleDelete = (key: string) => {
        setDeletingKey(key);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingKey) return;

        try {
            const response = await fetch("/api/settings/enums", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    enumGroup: selectedGroup,
                    key: deletingKey,
                }),
            });

            if (!response.ok) throw new Error("Failed to delete enum value");

            const { [deletingKey]: _, ...updatedEnum } = currentEnum;
            setCurrentEnum(updatedEnum);
            setIsDeleteDialogOpen(false);
            setDeletingKey(null);

            toast({
                title: "Success",
                description: "Enum value deleted successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete enum value",
                variant: "destructive",
            });
        }
    };

    // Filter and sort entries
    const filteredEntries = Object.entries(currentEnum)
        .filter(([key, value]) =>
            key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            value.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort(([keyA], [keyB]) => {
            return sortDirection === "asc"
                ? keyA.localeCompare(keyB)
                : keyB.localeCompare(keyA);
        });

    // Calculate pagination
    const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
    const paginatedEntries = filteredEntries.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    return (
        <div className="space-y-6 px-1 sm:px-2 md:px-0">
            <Card>
                <CardContent className="p-0">
                    <div className="space-y-4 p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                            <Select
                                value={selectedGroup}
                                onValueChange={(value: keyof typeof AllEnums) => setSelectedGroup(value)}
                            >
                                <SelectTrigger className="h-9 text-xs w-[280px] bg-muted/50 hover:bg-muted focus:bg-background rounded-full border-0">
                                    <SelectValue placeholder="Select enum type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(enumCategories).map(([name, category]) => (
                                        <SelectItem key={name} value={name} className="text-xs">
                                            <div className="flex items-center gap-2">
                                                {category === "DATABASE" ? (
                                                    <Database className="h-3.5 w-3.5 text-blue-500" />
                                                ) : (
                                                    <Code className="h-3.5 w-3.5 text-emerald-500" />
                                                )}
                                                <span>{name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs h-6 rounded-full">
                                    {Object.keys(currentEnum).length} values
                                </Badge>
                                {isDatabase && (
                                    <Badge variant="secondary" className="text-xs h-6 rounded-full">
                                        <Database className="h-3 w-3 mr-1" />
                                        {relatedTables.join(", ")}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                            <div className="relative flex-1 sm:w-[280px] w-full max-w-full sm:max-w-[280px]">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-500" />
                                <Input
                                    placeholder="Search data lists..."
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
                                <Button
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => setIsAddingNew(true)}
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-md border">
                            <Table className="text-xs">
                                <TableHeader className="bg-blue-50/70 dark:bg-blue-950/20">
                                    <TableRow>
                                        <TableHead className="text-xs font-medium py-1 h-6 border-b border-border/40 px-2 w-[200px]">Key</TableHead>
                                        <TableHead className="text-xs font-medium py-1 h-6 border-b border-border/40 px-2">Value</TableHead>
                                        <TableHead className="text-xs font-medium py-1 h-6 border-b border-border/40 px-2 text-right w-[60px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-[200px] text-center">
                                                <div className="flex flex-col items-center justify-center h-full">
                                                    <Loader2 className="h-8 w-8 animate-spin mb-2 text-blue-500" />
                                                    <p className="text-sm text-muted-foreground">Loading data...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : paginatedEntries.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-[200px] text-center">
                                                <div className="flex flex-col items-center justify-center h-full">
                                                    <AlertCircle className="h-8 w-8 mb-2 text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">No entries found</p>
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
                                        paginatedEntries.map(([key, value]) => (
                                            <TableRow key={key}>
                                                <TableCell className="py-1 px-2 h-7 text-xs font-medium">
                                                    {key}
                                                </TableCell>
                                                <TableCell className="py-1 px-2 h-7 text-xs text-muted-foreground">
                                                    {editingEnum?.key === key ? (
                                                        <Input
                                                            value={editingEnum.value}
                                                            onChange={(e) => setEditingEnum({ ...editingEnum, value: e.target.value })}
                                                            className="h-7 text-xs"
                                                        />
                                                    ) : (
                                                        value
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-1 px-2 h-7 text-xs text-right">
                                                    {editingEnum?.key === key ? (
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={handleSave}
                                                                className="h-7 w-7 hover:bg-muted"
                                                            >
                                                                <Save className="h-3.5 w-3.5 text-green-500" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setEditingEnum(null)}
                                                                className="h-7 w-7 hover:bg-muted"
                                                            >
                                                                <X className="h-3.5 w-3.5 text-muted-foreground" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="text-xs">
                                                                <DropdownMenuItem onClick={() => setEditingEnum({ key, value })}>
                                                                    <Edit2 className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-red-600"
                                                                    onClick={() => handleDelete(key)}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination controls */}
                            {filteredEntries.length > 0 && (
                                <div className="flex items-center justify-between px-2 py-2 border-t border-border/40">
                                    <div className="text-xs text-muted-foreground">
                                        Showing {Math.min(filteredEntries.length, currentPage * ITEMS_PER_PAGE + 1)} to {Math.min(filteredEntries.length, (currentPage + 1) * ITEMS_PER_PAGE)} of {filteredEntries.length} items
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
                    </div>
                </CardContent>
            </Card>

            {/* Add New Dialog */}
            <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Enum Value</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label className="text-xs">Key</Label>
                            <Input
                                value={newEnumKey}
                                onChange={(e) => setNewEnumKey(e.target.value.toUpperCase())}
                                placeholder="Enter enum key (e.g., NEW_VALUE)"
                                className="h-8 text-xs"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Value</Label>
                            <Input
                                value={newEnumValue}
                                onChange={(e) => setNewEnumValue(e.target.value)}
                                placeholder="Enter enum value"
                                className="h-8 text-xs"
                            />
                        </div>
                        <Button onClick={handleAddNew} className="w-full h-8 text-xs">
                            Add Value
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
                            Delete Entry
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm">
                            Are you sure you want to delete this entry? This action cannot be undone.
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
