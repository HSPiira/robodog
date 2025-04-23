"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { columns } from "./components/columns";
import { DataTable } from "./components/stickers-table";
import { StickerDetail } from "@/app/(authenticated)/stickers/components/sticker-detail";
import { useQuery } from "@tanstack/react-query";

interface Sticker {
    id: string;
    stickerNo: string;
    policy?: {
        id: string;
        policyNo: string;
        vehicle?: {
            id: string;
            registrationNo: string;
            make?: string;
            model?: string;
        };
        client?: {
            id: string;
            name: string;
            email?: string;
            phone?: string;
        };
    };
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
}

export default function StickersPage() {
    const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    const fetchStickers = useCallback(async () => {
        const response = await fetch("/api/stickers");
        if (!response.ok) {
            throw new Error("Failed to fetch stickers");
        }
        const data = await response.json();
        return data as Sticker[];
    }, []);

    const { data: stickers = [], isLoading, refetch } = useQuery<Sticker[]>({
        queryKey: ["stickers"],
        queryFn: fetchStickers
    });

    const handleStickerSelect = (sticker: Sticker) => {
        if (selectedSticker?.id === sticker.id) {
            // If clicking the same sticker, toggle the details panel
            setShowDetails(prev => !prev);
        } else {
            // If selecting a different sticker, show it and open the panel
            setSelectedSticker(sticker);
            setShowDetails(true);
        }
    };

    // Animation classes for the detail panel
    const detailPanelClasses = showDetails && selectedSticker
        ? "w-[320px] opacity-100 visible"
        : "w-0 opacity-0 invisible";

    return (
        <div className="p-6 space-y-6">
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="flex flex-wrap md:flex-nowrap gap-6 w-full overflow-hidden">
                    <div className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${showDetails ? 'w-[calc(100%-352px)]' : 'w-full'}`}>
                        <DataTable
                            columns={columns}
                            data={stickers}
                            searchKey="stickerNo"
                            onRowClick={handleStickerSelect}
                            selectedRow={selectedSticker}
                            showDetails={showDetails}
                            onRefresh={refetch}
                        />
                    </div>
                    <div className={`flex-shrink-0 transition-all duration-300 ease-in-out ${detailPanelClasses}`}>
                        {selectedSticker && (
                            <StickerDetail sticker={selectedSticker} onRefresh={refetch} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 