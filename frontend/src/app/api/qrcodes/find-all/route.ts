import { TYPE_MAPPING } from "@/constants";
import getPrismaClient from "@/lib/db";
import { verifySession } from "@/lib/session";
import { QRCode, ResultType } from "@/types";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Handles retrieving all QR codes associated with the authenticated user.
 *
 * - Validates the session token to ensure the user is authorized.
 * - Dynamically builds the Prisma `include` object to fetch related QR code types.
 * - Retrieves QR codes from the database, including their respective type-specific data.
 * - Transforms and returns the data in a structured format.
 *
 * @returns {Promise<NextResponse<ResultType>>} A JSON response containing the user's QR codes or an error message.
 */
export async function GET(): Promise<NextResponse<ResultType>> {
    try {
        // Retrieve session token from cookies
        const sessionToken = (await cookies()).get("session_token")?.value;
        const session = await verifySession(sessionToken);

        // If the user is not logged in, deny access
        if (!session?.userId) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized access",
                body: null
            }, { status: 401 });
        }

        const prisma = getPrismaClient();

        // Dynamically build the `include` object to fetch all related QR code types
        const include = TYPE_MAPPING.reduce((acc, mapping) => {
            acc[String(mapping.relation)] = true;
            return acc;
        }, {} as Record<string, boolean>);

        // Fetch QR codes with their related data
        const qrCodes = await prisma.qrcodes.findMany({
            where: { userId: Number(session.userId) },
            include: {
                ...include,
            },
        });

        // Handle potential query failure
        if (!qrCodes) {
            return NextResponse.json({
                success: false,
                message: "Internal server error",
                body: null
            }, { status: 500 });
        }

        // Transform results into a structured `QRCode` response
        const typedQRCodes = qrCodes.map((qr): QRCode => {
            for (const mapping of TYPE_MAPPING) {
                const relationData = qr[String(mapping.relation)];
                if (relationData) {
                    return {
                        ...qr,
                        type: mapping.type,
                        ...(typeof relationData === 'object' && relationData !== null ? relationData : {}),
                        qrCodeId: Number((relationData as any).qrCodeId),
                    } as QRCode;
                }
            }

            // Default case if no type-specific relation is found
            return {
                ...qr,
                type: "unknown",
            } as unknown as QRCode;
        });

        // Convert numerical fields to ensure proper type safety
        const safeQRCodes = typedQRCodes.map(qr => ({
            ...qr,
            id: Number(qr.id),
            userId: Number(qr.userId),
            scans: Number(qr.scans),
            ...("qrCodeId" in qr && { qrCodeId: Number(qr.qrCodeId) }),
        }));

        // Return the processed QR codes
        return NextResponse.json({
            success: true,
            message: "QR codes retrieved successfully",
            body: safeQRCodes
        }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            message: (error as Error).message,
            body: null
        }, { status: 500 });
    }
}