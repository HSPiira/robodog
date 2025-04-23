export interface Sticker {
    id: string;
    stickerNo: string;
    status: "AVAILABLE" | "ISSUED" | "VOIDED" | "EXPIRED";
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