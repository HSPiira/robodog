import { StickerStatus } from "@prisma/client";

export { StickerStatus };

export interface Sticker {
    id: string;
    stickerNo: string;
    status: StickerStatus;
    policy?: {
        id: string;
        policyNo: string;
        validFrom: string;
        validTo: string;
        status: string;
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