export enum StickerStatus {
    AVAILABLE = "AVAILABLE",
    ISSUED = "ISSUED",
    VOIDED = "VOIDED",
    EXPIRED = "EXPIRED"
}

export interface Insurer {
    id: string;
    name: string;
    email: string | null;
    address: string | null;
    phone: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    description: string | null;
}

export interface Sticker {
    id: string;
    stickerNo: string;
    status: StickerStatus;
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