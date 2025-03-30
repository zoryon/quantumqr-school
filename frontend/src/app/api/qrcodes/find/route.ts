import getPrismaClient from "@/lib/db";
import { verifySession } from "@/lib/session";
import { ResultType } from "@/types";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Handles retrieving a specific QR code by ID and type.
 *
 * - Extracts query parameters (`id` and `type`) from the request URL.
 * - Validates the `id` and `type` values.
 * - Fetches the base QR code record from the database.
 * - Retrieves type-specific data based on the provided `type`.
 * - Combines and returns the structured response.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<NextResponse<ResultType>>} A JSON response containing the requested QR code data or an error message.
 */
export async function GET(req: Request): Promise<NextResponse<ResultType>> {
    try {
        // Retrieve the session token from cookies and verify the user's session
        const sessionToken = (await cookies()).get("session_token")?.value;
        const session = await verifySession(sessionToken);

        const prisma = getPrismaClient();

        // Extract query parameters from request URL
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const type = searchParams.get("type");

        // Validate ID parameter
        const qrCodeId = Number(id);
        if (isNaN(qrCodeId)) {
            return NextResponse.json({
                success: false,
                message: "Invalid QR code ID",
                body: null
            }, { status: 400 });
        }

        // Validate Type parameter
        if (!type) {
            return NextResponse.json({
                success: false,
                message: "Type parameter is required",
                body: null
            }, { status: 400 });
        }

        // Retrieve the base QR code record
        const baseQr = await prisma.qrcodes.findUnique({
            where: { id: qrCodeId },
        });

        if (!baseQr) {
            return NextResponse.json({
                success: false,
                message: "QR Code not found",
                body: null
            }, { status: 404 });
        }

        // Retrieve type-specific data
        let specificData;
        switch (type) {
            case "vCards":
                specificData = await prisma.vcardqrcodes.findUnique({
                    where: { qrCodeId: baseQr.id },
                });
                break;
            case "classics":
                specificData = await prisma.classicqrcodes.findUnique({
                    where: { qrCodeId: baseQr.id },
                });
                break;
            // Add other cases here
            // case 'url':
            //     specificData = await prisma.urlqrcodes.findUnique(...);
            //     break;

            default:
                return NextResponse.json({
                    success: false,
                    message: "Unsupported QR Code type",
                    body: null
                }, { status: 400 });
        }

        // If no type-specific data is found, return an error
        if (!specificData) {
            return NextResponse.json({
                success: false,
                message: "Detailed data not found",
                body: null
            }, { status: 404 });
        }

        const isOwner = session?.userId as number === baseQr.userId;

        // Build typed response
        const response = isOwner
            ? { ...baseQr, type, ...specificData, isOwner }
            : { url: baseQr.url, type, ...specificData, isOwner };

        return NextResponse.json({
            success: true,
            message: "QR Code found",
            body: response
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching QR code:", error);
        return NextResponse.json({
            success: false,
            message: "Internal server error",
            body: null
        }, { status: 500 });
    }
}