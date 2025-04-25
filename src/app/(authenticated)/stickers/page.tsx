"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Sticker } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { StickerDetail } from "./components/sticker-detail";
import { useQuery } from "@tanstack/react-query";
import { columns } from "./components/columns";
import { stockColumns } from "./components/stock-columns";
import { DataTable } from "./components/stickers-table";

interface StickerStock {
    id: string;
    stickerNo: string;
    receivedAt: string;
    insurerId: string;
    isIssued: boolean;
    insurer: {
        id: string;
        name: string;
        code: string;
    };
    sticker?: Sticker;
}

const selectionColumn: ColumnDef<Sticker, any> = {
    id: "select",
    header: ({ table }) => (
        <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
        />
    ),
    cell: ({ row }) => (
        <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
        />
    ),
    enableSorting: false,
    enableHiding: false,
};

export default function StickersPage() {
    const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [activeTab, setActiveTab] = useState("stickers");

    // Fetch stickers
    const fetchStickers = useCallback(async () => {
        const response = await fetch("/api/stickers");
        if (!response.ok) {
            throw new Error("Failed to fetch stickers");
        }
        const data = await response.json();
        return data as Sticker[];
    }, []);

    // Fetch sticker stock
    const fetchStickerStock = useCallback(async () => {
        const response = await fetch("/api/stickers/stock");
        if (!response.ok) {
            throw new Error("Failed to fetch sticker stock");
        }
        const data = await response.json();
        return data as StickerStock[];
    }, []);

    const {
        data: stickers = [],
        isLoading: isLoadingStickers,
        refetch: refetchStickers
    } = useQuery<Sticker[]>({
        queryKey: ["stickers"],
        queryFn: fetchStickers
    });

    const {
        data: stickerStock = [],
        isLoading: isLoadingStickerStock,
        refetch: refetchStickerStock
    } = useQuery<StickerStock[]>({
        queryKey: ["stickerStock"],
        queryFn: fetchStickerStock
    });

    const handleStickerSelect = (sticker: Sticker) => {
        if (selectedSticker?.id === sticker.id) {
            setShowDetails(prev => !prev);
        } else {
            setSelectedSticker(sticker);
            setShowDetails(true);
        }
    };

    // Animation classes for the detail panel
    const detailPanelClasses = showDetails && selectedSticker
        ? "w-[320px] opacity-100 visible"
        : "w-0 opacity-0 invisible";

    const isLoading = isLoadingStickers || isLoadingStickerStock;

    return (
        <div className="p-6 space-y-6">
            <Tabs defaultValue="stickers" className="w-full" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="stickers">Stickers</TabsTrigger>
                    <TabsTrigger value="stock">Stock Management</TabsTrigger>
                </TabsList>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        <TabsContent value="stickers" className="m-0">
                            <div className="flex flex-wrap md:flex-nowrap gap-6 w-full overflow-hidden">
                                <div className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${showDetails ? 'w-[calc(100%-352px)]' : 'w-full'}`}>
                                    <DataTable
                                        columns={columns}
                                        data={stickers}
                                        searchKey="stickerNo"
                                        onRowClick={handleStickerSelect}
                                        selectedRow={selectedSticker}
                                        showDetails={showDetails}
                                        onRefresh={refetchStickers}
                                    />
                                </div>
                                <div className={`flex-shrink-0 transition-all duration-300 ease-in-out ${detailPanelClasses}`}>
                                    {selectedSticker && (
                                        <StickerDetail sticker={selectedSticker} onRefresh={refetchStickers} />
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="stock" className="m-0">
                            <div className="flex flex-wrap md:flex-nowrap gap-6 w-full overflow-hidden">
                                <div className="flex-1 min-w-0">
                                    <DataTable
                                        columns={stockColumns}
                                        data={stickerStock}
                                        searchKey="stickerNo"
                                        onRefresh={refetchStickerStock}
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
} 