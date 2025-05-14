export type Tier = {
    id: number;
    name: string;
    price: number;
    description: string;
    maxQRCodes: number;
    createdAt: Date | null;
    updatedAt: Date | null;
}