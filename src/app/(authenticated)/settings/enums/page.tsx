'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit2, Plus, Trash2, Save, X, ChevronDown, ChevronUp, MoreHorizontal, Database, Code } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AllEnums, enumCategories, isDatabaseEnum, getRelatedTables, validateEnumValue, updateDatabaseEnumValue } from '@/lib/services/enums';

type EnumType = {
    [key: string]: string;
};

export default function EnumsManagementPage() {
    const { toast } = useToast();
    const [selectedGroup, setSelectedGroup] = useState<string>(Object.keys(AllEnums)[0]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingEnum, setEditingEnum] = useState<{
        key: string;
        value: string;
    } | null>(null);
    const [newEnumKey, setNewEnumKey] = useState('');
    const [newEnumValue, setNewEnumValue] = useState('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState('');

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
                    throw new Error(validation.error || 'Invalid enum value');
                }

                const result = await updateDatabaseEnumValue(
                    selectedGroup as keyof typeof AllEnums,
                    editingEnum.key,
                    editingEnum.value
                );

                if (!result.success) {
                    throw new Error(result.error || 'Failed to update database enum');
                }
            }

            // Update the enum in the application
            const response = await fetch('/api/settings/enums', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    enumGroup: selectedGroup,
                    key: editingEnum.key,
                    value: editingEnum.value,
                }),
            });

            if (!response.ok) throw new Error('Failed to update enum');

            toast({
                title: "Enum Updated",
                description: `${editingEnum.key} has been updated successfully.`,
            });

            setEditingEnum(null);
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
                    throw new Error(validation.error || 'Invalid enum value');
                }
            }

            const response = await fetch('/api/settings/enums', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    enumGroup: selectedGroup,
                    key: newEnumKey,
                    value: newEnumValue,
                }),
            });

            if (!response.ok) throw new Error('Failed to add enum');

            toast({
                title: "Success",
                description: "New enum value added successfully",
            });

            setIsAddingNew(false);
            setNewEnumKey('');
            setNewEnumValue('');
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add enum value",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (key: string) => {
        // Implement delete functionality
        toast({
            title: "Not Implemented",
            description: "Delete functionality will be added soon.",
            variant: "destructive",
        });
    };

    const currentEnum = AllEnums[selectedGroup as keyof typeof AllEnums] as EnumType;
    const isDatabase = isDatabaseEnum(selectedGroup as keyof typeof AllEnums);
    const relatedTables = getRelatedTables(selectedGroup as keyof typeof AllEnums);

    // Filter and sort enum entries
    const filteredEntries = Object.entries(currentEnum)
        .filter(([key, value]) =>
            key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            value.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort(([keyA], [keyB]) => {
            if (sortDirection === 'asc') {
                return keyA.localeCompare(keyB);
            } else {
                return keyB.localeCompare(keyA);
            }
        });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                        <SelectTrigger className="w-[240px]">
                            <SelectValue placeholder="Select enum type" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(enumCategories).map(([name, category]) => (
                                <SelectItem key={name} value={name}>
                                    <div className="flex items-center gap-2">
                                        {category === 'DATABASE' ? (
                                            <Database className="h-3.5 w-3.5" />
                                        ) : (
                                            <Code className="h-3.5 w-3.5" />
                                        )}
                                        {name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Badge variant="outline" className="text-xs">
                        {Object.keys(currentEnum).length} values
                    </Badge>

                    {isDatabase && (
                        <Badge variant="secondary" className="text-xs">
                            {relatedTables.join(', ')}
                        </Badge>
                    )}
                </div>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
                                <DialogTrigger asChild>
                                    <Button size="icon" variant="outline">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add New Enum Value</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 pt-4">
                                        <div className="space-y-2">
                                            <Label>Key</Label>
                                            <Input
                                                value={newEnumKey}
                                                onChange={(e) => setNewEnumKey(e.target.value.toUpperCase())}
                                                placeholder="Enter enum key (e.g., NEW_VALUE)"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Value</Label>
                                            <Input
                                                value={newEnumValue}
                                                onChange={(e) => setNewEnumValue(e.target.value)}
                                                placeholder="Enter enum value"
                                            />
                                        </div>
                                        <Button onClick={handleAddNew} className="w-full">
                                            Add Value
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Add new enum value</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{selectedGroup}</CardTitle>
                            <CardDescription>
                                {isDatabase
                                    ? `Database enum used in ${relatedTables.join(', ')} ${relatedTables.length === 1 ? 'table' : 'tables'}`
                                    : 'Application enum used in frontend components'}
                            </CardDescription>
                        </div>
                        {isDatabase && (
                            <Badge variant="secondary">
                                <Database className="h-3.5 w-3.5 mr-1.5" />
                                Database Enum
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Input
                                placeholder="Search enums..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-[200px] h-8 rounded-full bg-muted px-4 text-xs"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                            >
                                Sort {sortDirection === 'asc' ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                            </Button>
                        </div>

                        <div className="rounded-md border overflow-x-auto">
                            <div className="min-h-[300px] flex flex-col">
                                <Table>
                                    <TableHeader className="bg-primary/5">
                                        <TableRow>
                                            <TableHead className="text-xs py-2 h-8 border-b border-border/40 px-2 w-[200px]">Key</TableHead>
                                            <TableHead className="text-xs py-2 h-8 border-b border-border/40 px-2">Value</TableHead>
                                            <TableHead className="text-xs py-2 h-8 border-b border-border/40 px-2 text-right w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredEntries.length > 0 ? (
                                            filteredEntries.map(([key, value]) => (
                                                <TableRow key={key} className="border-0 hover:bg-muted/50 text-xs h-5">
                                                    <TableCell className="py-0.5 px-2 border-b border-border/40">
                                                        <span className="text-xs font-medium">{key}</span>
                                                    </TableCell>
                                                    <TableCell className="py-0.5 px-2 border-b border-border/40">
                                                        {editingEnum?.key === key ? (
                                                            <Input
                                                                value={editingEnum.value}
                                                                onChange={(e) => setEditingEnum({ ...editingEnum, value: e.target.value })}
                                                                className="max-w-md text-xs"
                                                            />
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">{value}</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="py-0.5 px-2 border-b border-border/40">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {editingEnum?.key === key ? (
                                                                <>
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button size="icon" variant="ghost" onClick={handleSave}>
                                                                                    <Save className="h-3.5 w-3.5 text-green-500" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Save changes</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>

                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Button size="icon" variant="ghost" onClick={() => setEditingEnum(null)}>
                                                                                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                                                                                </Button>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p>Cancel</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                </>
                                                            ) : (
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button size="icon" variant="ghost" className="h-6 w-6 p-0">
                                                                            <span className="sr-only">Open menu</span>
                                                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="text-xs">
                                                                        <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            className="text-xs"
                                                                            onClick={() => setEditingEnum({ key, value })}
                                                                        >
                                                                            Edit value
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            className="text-xs text-red-600"
                                                                            onClick={() => handleDelete(key)}
                                                                        >
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={3}
                                                    className="h-8 text-center text-xs"
                                                >
                                                    No results.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 