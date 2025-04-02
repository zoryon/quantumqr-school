import getPrismaClient from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * Handles updating the scan count for a QR code.
 *
 * - Extracts the QR code `id` from the request body.
 * - Validates the `id` to ensure it is a valid number.
 * - Increments the `scans` count for the corresponding QR code in the database.
 * - Returns the updated scan count in the response.
 *
 * @param {Request} req - The incoming PUT request containing the QR code `id` in the body.
 * @returns {Promise<NextResponse>} A JSON response with the updated scan count or an error message.
 */
export async function PUT(req: Request): Promise<NextResponse> {
    try {
        // Parse the request body to extract the QR code ID
        const { id } = await req.json();

        // Validate that the provided ID is a number
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const prisma = getPrismaClient();

        // Increment the scan count for the specified QR code
        const updated = await prisma.qrcodes.update({
            where: { id },
            data: {
                scans: {
                    increment: 1 // Increase the scan count by 1
                }
            }
        });

        // Return the updated scan count in the response
        return NextResponse.json({ scans: updated.scans }, { status: 200 });
    } catch (error) {
        console.error("Error updating scan count: ", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}