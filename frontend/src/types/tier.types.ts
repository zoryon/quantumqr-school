export type Tier = {
    id: number;
    name: string;
    price: number;
    description: string;
    maxQrCodes: number;
    createdAt: Date | null;
    updatedAt: Date | null;
}