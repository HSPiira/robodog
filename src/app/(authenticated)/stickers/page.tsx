"use client";

import { useEffect, useState } from "react";
import { DataTable } from "./components/stickers-table";
import { columns } from "./components/columns";
import { stockColumns, StickerStockWithRelations } from "./components/stock-columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateStockForm } from "./components/create-stock-form";
import { StickerStockDetail } from "./components/stock-detail";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Prisma } from "@prisma/client";

type StickerWithRelations = Prisma.StickerIssuanceGetPayload<{
    include: {
        policy: {
            include: {
                vehicle: true;
                client: true;
            };
        };
    };
}>;

export default function StickersPage() {
    const [stickers, setStickers] = useState<StickerWithRelations[]>([]);
    const [stock, setStock] = useState<StickerStockWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStock, setSelectedStock] = useState<StickerStockWithRelations | null>(null);

    const fetchStickers = async () => {
        const response = await fetch("/api/stickers");
        if (!response.ok) {
            throw new Error("Failed to fetch stickers");
        }
        const data = await response.json();
        setStickers(data);
    };

    const fetchStock = async () => {
        const response = await fetch("/api/stickers/stock");
        if (!response.ok) {
            throw new Error("Failed to fetch sticker stock");
        }
        const data = await response.json();
        setStock(data);
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await Promise.all([fetchStickers(), fetchStock()]);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleStockSelect = (stock: StickerStockWithRelations) => {
        setSelectedStock(current => current?.id === stock.id ? null : stock);
    };

    if (loading) {
        return (
            <div className="container mx-auto py-10 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <Tabs defaultValue="stickers" className="w-full">
                <TabsList>
                    <TabsTrigger value="stickers">Stickers</TabsTrigger>
                    <TabsTrigger value="stock">Stock</TabsTrigger>
                </TabsList>
                <TabsContent value="stickers">
                    <DataTable
                        columns={columns}
                        data={stickers}
                        onRefresh={fetchStickers}
                    />
                </TabsContent>
                <TabsContent value="stock">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={selectedStock ? "md:col-span-2" : "md:col-span-3"}>
                            <DataTable
                                columns={stockColumns}
                                data={stock}
                                onRefresh={fetchStock}
                                onRowClick={handleStockSelect}
                                selectedRow={selectedStock}
                                searchKey="serialNumber"
                                customButton={
                                    <CreateStockForm
                                        trigger={
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-full flex-shrink-0 border-blue-500/20 hover:border-blue-500 hover:bg-blue-500/10 text-blue-500"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        }
                                        onStockCreated={fetchStock}
                                    />
                                }
                            />
                        </div>
                        {selectedStock && (
                            <div className="md:col-span-1">
                                <StickerStockDetail
                                    stock={selectedStock}
                                    onClose={() => setSelectedStock(null)}
                                    onDelete={() => {
                                        setSelectedStock(null);
                                        fetchStock();
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
} 