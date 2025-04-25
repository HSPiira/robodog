"use client";

import * as React from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { CreateStickerForm } from "./create-sticker-form";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    onRowClick?: (row: TData) => void;
    selectedRow?: TData | null;
    showDetails?: boolean;
    onRefresh?: () => void;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey = "stickerNo",
    onRowClick,
    selectedRow,
    showDetails = false,
    onRefresh,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/stickers/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete sticker");
            }

            toast.success("Sticker deleted successfully");
            onRefresh?.();
        } catch (error) {
            console.error("Error deleting sticker:", error);
            toast.error("Failed to delete sticker");
        }
    };

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <Input
                    placeholder={`Search by ${searchKey}...`}
                    value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn(searchKey)?.setFilterValue(event.target.value)
                    }
                    className="w-[200px] h-8 rounded-full bg-muted px-4 text-xs"
                />
                <CreateStickerForm
                    trigger={
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    }
                    onStickerCreated={onRefresh}
                />
            </div>
            <div className="rounded-md border overflow-hidden">
                <div className="min-h-[300px] flex flex-col">
                    <Table>
                        <TableHeader className="bg-primary/5">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead
                                                key={header.id}
                                                className="text-xs py-2 h-10 border-b border-border/40 px-4"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className={`border-0 cursor-pointer hover:bg-muted/50 text-xs h-5 ${selectedRow === row.original ? "bg-muted" : ""}`}
                                        onClick={() => onRowClick?.(row.original as TData)}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                className="py-1.5 px-4 border-b border-border/40"
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No stickers found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="flex items-center justify-between px-2">
                <div className="flex-1 text-xs text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} row(s)
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="h-7 w-7 rounded-full"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-7 w-7 rounded-full"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
} 