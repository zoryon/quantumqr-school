import getPrismaClient from "@/lib/db";
import { validateConfirmationToken } from "@/lib/mailer";
import { isLoggedIn } from "@/lib/session";
import { ResultType } from "@/types";
import { NextResponse } from "next/server";

/**
 * Handles the GET request for email confirmation.
 * Validates the confirmation token and updates the user's email status to confirmed.
 * 
 * @param req - The incoming HTTP request
 * @returns {Promise<NextResponse<ResultType>>} A JSON response indicating success or failure
 */
export async function GET(req: Request): Promise<NextResponse<ResultType>> {
    // If the user is already logged in, prevent email confirmation
    if (await isLoggedIn()) {
        return NextResponse.json<ResultType>({ 
            success: false,
            message: "You are already logged in.",
            body: null
        }, { status: 401 });
    }

    // Extract the token from the URL's query parameters
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    // Validate the token and extract the associated user information
    const confirmedToken = await validateConfirmationToken(token || "");

    if (!confirmedToken?.userId) {
        return NextResponse.json<ResultType>({ 
            success: false,
            message: "Invalid token.",
            body: null
        }, { status: 401 });
    }

    const prisma = getPrismaClient();

    // Update the user's email confirmation status to true
    const updatedUser = await prisma.users.update({
        where: {
            id: confirmedToken.userId as number // Use the userId extracted from the token
        },
        data: {
            isEmailConfirmed: true // Mark the email as confirmed
        }
    });

    // If the user could not be found or updated, return an error response
    if (!updatedUser) {
        return NextResponse.json<ResultType>({ 
            success: false,
            message: "User not found.",
            body: null
        }, { status: 404 });
    }

    // Return a success response indicating the email was confirmed successfully
    return NextResponse.json<ResultType>({ 
        success: true,
        message: "Email confirmed successfully.",
        body: null
    }, { status: 200 });
}