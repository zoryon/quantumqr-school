import { NextResponse } from "next/server"
import getPrismaClient from "@/lib/db";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";
import { ResultType, PrismaModel } from "@/types";
import { TYPE_MAPPING } from "@/constants";

/**
 * Handles updating a QR code by validating the session, checking for duplicate names,
 * and performing an atomic database transaction to update the relevant records.
 *
 * - Verifies the user's session and ensures they are authorized.
 * - Validates the request payload against the corresponding schema.
 * - Prevents duplicate QR code names for the same user.
 * - Uses a Prisma transaction to update both the main QR code table and the type-specific table.
 * - Returns a success or failure response based on the operation's outcome.
 *
 * @param {Request} request - The incoming HTTP PUT request containing the update data.
 * @returns {Promise<NextResponse<ResultType>>} - A JSON response indicating success or failure.
 */
export async function PUT(request: Request): Promise<NextResponse<ResultType>> {
    try {
        // Retrieve the session token from cookies and verify the user's session
        const sessionToken = (await cookies()).get("session_token")?.value;
        const session = await verifySession(sessionToken);

        // If the session is invalid or user is not authenticated, deny access
        if (!session?.userId) {
            return NextResponse.json<ResultType>({
                success: false,
                message: "Unauthorized",
                body: null
            }, { status: 401 });
        }

        // Parse the request body to extract data
        const body = await request.json();
        const { id, type, ...values } = body;

        const prisma = getPrismaClient();

        // Find the appropriate mapping for the QR code type
        const mapping = TYPE_MAPPING.find(m => m.type === type)
        if (!mapping) {
            return NextResponse.json<ResultType>({
                success: false,
                message: "Invalid QR code type",
                body: null
            }, { status: 400 });
        }

        // Validate the extracted data using the corresponding schema
        const validatedData = mapping.schema.parse(values);

        // Extract name separately for uniqueness check
        const { name, ...data} = validatedData;

        // Check if a QR code with the same name already exists for the user, BUT not the same one being updated
        const existingQRCode = await prisma.qrcodes.findFirst({
            where: {
                userId: Number(session.userId),
                name: name,
                NOT: {
                    id: Number(id)
                }
            }
        });

        if (existingQRCode && existingQRCode.name === name) {
            return NextResponse.json<ResultType>({
                success: false,
                message: "A QR Code with the same name already exists",
                body: null
            }, { status: 400 });
        }

        // Create a transaction to update both the main QR code record and the type-specific table
        const transaction = [
            // Update the main QR code entry
            prisma.qrcodes.update({
                where: {
                    id: Number(id),
                    userId: Number(session.userId)
                },
                data: { 
                    name: name,
                    updatedAt: new Date()
                }
            }),

            // Update the related table specific to the QR code type
            (prisma[mapping.model as PrismaModel] as any).update({
                where: { qrCodeId: Number(id) },
                data: data,
            }),
        ];

        // Ensure the transaction array is properly formed
        if (!transaction) {
            return NextResponse.json<ResultType>({
                success: false,
                message: "Malformed request",
                body: null
            }, { status: 400 });
        }

        // Execute the transaction to perform an atomic update
        const result = await prisma.$transaction(transaction);

        return NextResponse.json<ResultType>({
            success: true,
            message: "QR Code updated successfully",
            body: result
        }, { status: 200 });
    } catch (error) {
        console.error("Error updating: ", error);
        return NextResponse.json<ResultType>({
            success: false,
            message: "Internal server error",
            body: null
        }, { status: 500 });
    }
}