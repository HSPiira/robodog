import { StickerWithRelations } from "@/types/sticker";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type StickerDetailProps = {
    sticker: StickerWithRelations;
    onClose: () => void;
};

export function StickerDetail({ sticker, onClose }: StickerDetailProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Sticker Details</CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
                        <p>{sticker.id}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                        <p>{new Date(sticker.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Issued At</h3>
                        <p>{new Date(sticker.issuedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Valid From</h3>
                        <p>{new Date(sticker.validFrom).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Valid To</h3>
                        <p>{new Date(sticker.validTo).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                        <p className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${sticker.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                            {sticker.isActive ? "Active" : "Expired"}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Stock</h3>
                        <p>{sticker.stock.serialNumber}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 