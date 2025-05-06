import { useState } from "react";
import { StickerWithRelations } from "@/types/sticker";
import { StickerDetail } from "./sticker-detail";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

type StickerListProps = {
    stickers: StickerWithRelations[];
    onAddSticker: () => void;
};

export function StickerList({ stickers, onAddSticker }: StickerListProps) {
    const [selectedSticker, setSelectedSticker] = useState<StickerWithRelations | null>(null);
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired">("all");

    const filteredStickers = stickers.filter((sticker) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "active") return sticker.isActive;
        return !sticker.isActive;
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Stickers</h2>
                <Button onClick={onAddSticker} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Sticker
                </Button>
            </div>

            <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | "active" | "expired")}>
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="expired">Expired</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="grid gap-4">
                {filteredStickers.map((sticker) => (
                    <div
                        key={sticker.id}
                        className="rounded-lg border p-4 hover:bg-accent cursor-pointer"
                        onClick={() => setSelectedSticker(sticker)}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium">Sticker #{sticker.id}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Issued: {new Date(sticker.issuedAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${sticker.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}>
                                {sticker.isActive ? "Active" : "Expired"}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedSticker && (
                <StickerDetail
                    sticker={selectedSticker}
                    onClose={() => setSelectedSticker(null)}
                />
            )}
        </div>
    );
} 