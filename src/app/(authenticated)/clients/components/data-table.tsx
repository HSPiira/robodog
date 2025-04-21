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
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    actionButton?: React.ReactNode;
    onRowClick?: (row: TData) => void;
    fetchData?: () => void;
    navigateOnDoubleClick?: boolean;
    navigateToClientDetails?: (clientId: string) => void;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey = "name",
    actionButton,
    onRowClick,
    fetchData,
    navigateOnDoubleClick = true,
    navigateToClientDetails: externalNavigate,
}: DataTableProps<TData, TValue>) {
    const router = useRouter();
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [selectedRow, setSelectedRow] = React.useState<TData | null>(null);

    // Function to navigate to client details page
    const navigateToClientDetails = externalNavigate || ((clientId: string) => {
        router.push(`/clients/${clientId}`);
    });

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
        meta: {
            fetchCustomers: fetchData,
            navigateToClientDetails: navigateToClientDetails,
        },
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Input
                    placeholder={`Search by ${searchKey}...`}
                    value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn(searchKey)?.setFilterValue(event.target.value)
                    }
                    className="w-[200px] h-8 rounded-full bg-muted px-4 text-xs"
                />
                {actionButton}
            </div>
            <div className="rounded-md border overflow-x-auto">
                <div className="min-h-[300px] flex flex-col">
                    <Table>
                        <TableHeader className="bg-primary/5">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} className="text-xs py-2 h-8 border-b border-border/40 px-2">
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
                                        onClick={() => {
                                            setSelectedRow(row.original as TData);
                                            onRowClick?.(row.original as TData);
                                        }}
                                        onDoubleClick={() => {
                                            if (navigateOnDoubleClick && (row.original as any).id) {
                                                navigateToClientDetails((row.original as any).id);
                                            }
                                        }}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="py-0.5 px-2 border-b border-border/40">
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
            <div className="flex items-center justify-end space-x-2 mt-2">
                <div className="flex-1 text-xs text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="h-8 w-8 rounded-full"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-8 w-8 rounded-full"
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next</span>
                    </Button>
                </div>
            </div>
        </div>
    );
} 