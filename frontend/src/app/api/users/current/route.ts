import getPrismaClient from "@/lib/db";
import { verifySession } from "@/lib/session";
import { omit } from "@/lib/utils";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Handles the retrieval of the currently authenticated user's public information.
 *
 * - Extracts the session token from cookies.
 * - Verifies the session to ensure the user is authenticated.
 * - Fetches the user from the database if the session is valid.
 * - Removes sensitive fields (e.g., `id`, `password`) before returning the user data.
 * - Returns the sanitized user information or an appropriate error response.
 *
 * @returns {Promise<NextResponse>} A JSON response containing the user's public data or an error message.
 */
export async function GET(): Promise<NextResponse> {
    try {
        // Retrieve the session token from cookies
        const sessionToken = (await cookies()).get("session_token")?.value;
        const session = await verifySession(sessionToken);

        // If no valid session, return an error response
        if (!session?.userId) {
            return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
        }

        // Initialize Prisma client and fetch user data based on session userId
        const prisma = getPrismaClient();
        const user = await prisma.users.findUnique({
            where: {
                id: session.userId as number,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Remove sensitive data before sending the response
        const publicData = omit(user, ["id", "password"]);
        
        // Return the sanitized user data
        return NextResponse.json(publicData, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
