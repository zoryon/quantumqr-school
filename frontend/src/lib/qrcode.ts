import { QR_CODES_TYPES_ARRAY } from "@/constants";
import { QRCode as QRCodeType, ClassicResponse, QRCodeTypes, VCardResponse } from "@/types";
import QRCode from "qrcode";

export async function generateQRCode(obj: string): Promise<string> {
    // Generate the QR code as an SVG string from the website URL
    const svgString = await QRCode.toString(obj, {
        type: "svg",
        color: {
            dark: "#000000",
            light: "#ffffff"
        }
    });

    // Convert the SVG string to a base64 encoded data URL
    return `data:image/svg+xml;base64,${Buffer.from(svgString).toString("base64")}`;
}

// Type guards for discriminating QR code types

/**
 * Type guard to check if a given string is a valid QR code type ("vCards" or "classics").
 * This helps in ensuring the string value is one of the allowed types.
 */
export function isQRCodeType(type: string): type is QRCodeTypes {
    return QR_CODES_TYPES_ARRAY
        .map(t => t.toLowerCase()) // Convert both types and input to lowercase for case-insensitive comparison
        .includes(type.toLowerCase()) // Check if the type exists in the array
}

/**
 * Type guard to check if a QR code is of type "vCards".
 * This function helps in narrowing down the type of QR code in runtime.
 */
export function isVCardQR(code: QRCodeType): code is VCardResponse {
    return code.type === "vCards"; // Discriminates based on the type field
}

/**
 * Type guard to check if a QR code is of type "classics".
 * This function helps in narrowing down the type of QR code in runtime.
 */
export function isClassicQR(code: QRCodeType): code is ClassicResponse {
    return code.type === "classics"; // Discriminates based on the type field
}