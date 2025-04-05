import { QR_CODES_TYPES_ARRAY } from "@/constants";
import { classicqrcodes, PrismaClient, qrcodes, vcardqrcodes } from "@prisma/client";
import { z } from "zod";

// Define a union type `QRCodeTypes` that is derived from the elements of `QR_CODES_TYPES_ARRAY`.
export type QRCodeTypes = typeof QR_CODES_TYPES_ARRAY[number];

// Base object types for QR Codes
/**
 * Base structure for a QR code, including the model's fields and a `type` to classify the QR code.
 * The `type` can either be "vCards" or "classics" based on the QR code category.
 */
export type BaseQrCode = qrcodes & {
    type: QRCodeTypes;
};

/**
 * A type for Classic QR codes that extends the Prisma `classicqrcodes` model and assigns it the type "classics".
 */
export type ClassicQRCode = classicqrcodes & {
    type: "classics";
}

/**
 * A type for vCard QR codes that extends the Prisma `vcardqrcodes` model and assigns it the type "vCards".
 */
export type VCardQRCode = vcardqrcodes & {
    type: "vCards";
}

// General QRCode type, which can be either a ClassicQRCode or a VCardQRCode, both extending BaseQrCode.
export type QRCode = BaseQrCode & (ClassicQRCode | VCardQRCode);

// Responses for specific types of QR codes
/**
 * Type for a response containing a vCard QR code, which includes both `BaseQrCode` and `VCardQRCode`.
 */
export type VCardResponse = BaseQrCode & VCardQRCode;

/**
 * Type for a response containing a Classic QR code, which includes both `BaseQrCode` and `ClassicQRCode`.
 */
export type ClassicResponse = BaseQrCode & ClassicQRCode;

/**
 * Represents the structure of a QR code card displayed in the UI.
 * 
 * - `title`: The type of QR code.
 * - `description`: A brief explanation of what the QR code does.
 * - `icon`: A FontAwesome class representing the icon for this QR code type.
 */
export type QRCodeCard = {
    title: QRCodeTypes;
    description: string;
    icon: string;
}

/**
 * Defines the mapping between QR code types, database models, and validation schemas.
 * 
 * - `type`: The category of the QR code (e.g., "classics", "vCards").
 * - `relation`: The name of the Prisma relation corresponding to this QR code type.
 * - `model`: The database model used for storing and retrieving data for this QR type.
 * - `schema`: The Zod validation schema associated with this QR code type.
 */
export type QrTypeMapping = {
    type: QRCodeTypes;
    relation: keyof PrismaClient;
    model: keyof PrismaClient;
    schema: z.ZodSchema;
};

/**
 * Defines the design options for customizing the appearance of the QR code.
 * 
 * - `fgColor`: The foreground color of the QR code.
 * - `bgColor`: The background color of the QR code.
 * - `logo`: An optional logo file to be embedded in the QR code.
 * - `logoSize`: The size of the logo in percentage (default is 20%).
 * - `qrStyle`: The style of the QR code, either "squares" or "dots".
 */
export type DesignOptions = {
    fgColor: string;
    bgColor: string;
    logo: string | null;
    logoSize: number;
};
