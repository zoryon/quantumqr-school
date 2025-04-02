import getPrismaClient from "@/lib/db";
import { verifySession } from "@/lib/session";
import { ResultType } from "@/types";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Deletes a QR code belonging to the authenticated user.
 *
 * - Ensures the user is logged in before proceeding.
 * - Validates the provided QR code ID.
 * - Deletes the QR code only if it belongs to the authenticated user.
 * - Returns an appropriate response based on the result.
 *
 * @param {Request} req - The incoming request object.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure.
 */
export async function DELETE(req: Request): Promise<NextResponse> {
    try {
        // Verify user session
        const sessionToken = (await cookies()).get("session_token")?.value;
        const session = await verifySession(sessionToken);

        if (!session?.userId) {
            return NextResponse.json<ResultType>({
                success: false,
                message: "You are not logged in",
                body: null
            }, { status: 401 });
        }

        // Parse and validate request body
        const { id } = await req.json();
        if (isNaN(Number(id))) {
            return NextResponse.json<ResultType>({
                success: false,
                message: "Invalid QR code ID",
                body: null
            }, { status: 400 });
        }

        // Delete the QR code
        const prisma = getPrismaClient();
        const deleted = await prisma.qrcodes.delete({
            where: {
                id,
                userId: session.userId,
            },
        });

        return NextResponse.json<ResultType>({
            success: true,
            message: "QR code deleted",
            body: deleted
        }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json<ResultType>({ 
            success: false, 
            message: "Internal server error",
            body: null
        }, { status: 500 });
    }

}