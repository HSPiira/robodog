import { StickerStock } from "@prisma/client";

export interface StickerWithRelations {
    id: number;
    createdAt: Date;
    issuedAt: Date;
    validFrom: Date;
    validTo: Date;
    isActive: boolean;
    stock: StickerStock;
} 