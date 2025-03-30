import { cardDetailsFormSchema, classicDetailsFormSchema } from "@/lib/schemas";
import { QRCodeCard, QrTypeMapping } from "@/types/qrcode.types";

// String types for QR Code categories
// This array contains the types of QR codes available: "vCards" and "classics".
export const QR_CODES_TYPES_ARRAY = ["vCards", "classics"] as const;

/**
 * A predefined list of QR code categories available for users.
 * 
 * Each QR code type includes:
 * - `title`: The category name.
 * - `description`: A short description of its function.
 * - `icon`: A FontAwesome icon for visual representation.
 */
export const QR_CODE_CARDS: QRCodeCard[] = [
    {
        title: "classics",
        description: "Share your website",
        icon: "fa-solid fa-globe-pointer",
    },
    {
        title: "vCards",
        description: "Share your virtual business card",
        icon: "fa-solid fa-address-card",
    },
    
] as const;

/**
 * Maps QR code types to their respective Prisma database models and validation schemas.
 * 
 * This mapping ensures proper linkage between:
 * - API request handling.
 * - Database operations (Prisma).
 * - Data validation (Zod schemas).
 */
export const TYPE_MAPPING: QrTypeMapping[] = [
    { 
        type: "vCards" as const, 
        relation: "vcardqrcodes", 
        model: "vcardqrcodes",
        schema: cardDetailsFormSchema
    },
    { 
        type: "classics" as const, 
        relation: "classicqrcodes", 
        model: "classicqrcodes",
        schema: classicDetailsFormSchema
    },
];