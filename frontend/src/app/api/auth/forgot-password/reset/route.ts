import getPrismaClient from "@/lib/db";
import { validateResetToken } from "@/lib/mailer";
import { isLoggedIn } from "@/lib/session";
import { ResultType } from "@/types";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

/**
 * Handles the POST request for resetting a user's password using a valid reset token.
 * This function verifies the token, checks the new password and confirmation,
 * and updates the user's password in the database.
 * 
 * @returns {Promise<NextResponse<ResultType>>} JSON response indicating success or failure of the password reset process
 */
export async function POST(req: Request): Promise<NextResponse<ResultType>> {
    try {
        if (await isLoggedIn()) {
            return NextResponse.json<ResultType>({
                success: false,
                message: "You are already logged in.",
                body: null
            }, { status: 401 });
        }

        // Extract necessary data from the request body
        const { token, password, passwordConfirmation } = await req.json();

        // Validate the reset token, which will also return the user ID if the token is valid
        const confirmedToken = await validateResetToken(token || "");

        // If the token is invalid, return an error response
        if (!confirmedToken?.userId) {
            return NextResponse.json<ResultType>({
                success: false,
                message: "Invalid token.",
                body: null
            }, { status: 401 });
        }

        // Validate the input: Ensure all fields are provided and valid
        if (
            typeof password !== "string" || typeof passwordConfirmation !== "string" ||
            !password.trim() || !passwordConfirmation.trim() ||
            !token 
        ) {
            return NextResponse.json<ResultType>({
                success: false,
                message: "Malformed data.",
                body: null
            }, { status: 400 });
        }

        // Ensure the password meets the minimum length requirement
        if (password.length < 5) {
            return NextResponse.json<ResultType>({
                success: false,
                message: "Password must be at least 6 characters long.",
                body: null
            }, { status: 400 });
        }

        // Check if the password and password confirmation match
        if (password !== passwordConfirmation) {
            return NextResponse.json<ResultType>({
                success: false,
                message: "Passwords do not match.",
                body: null
            }, { status: 400 })
        };

        const prisma = getPrismaClient();

        // Update the user's password in the database (ensure the email is confirmed)
        const updatedUser = await prisma.users.update({
            where: {
                id: confirmedToken.userId as number,
                isEmailConfirmed: true // Ensure that only confirmed users can update passwords
            },
            data: {
                password: await bcrypt.hash(password, 10) // Hash the new password before saving
            }
        });

        // If the user was not found or the update failed, return an error
        if (!updatedUser) {
            return NextResponse.json<ResultType>({
                success: false,
                message: "User not found.",
                body: null
            }, { status: 404 });
        }

        return NextResponse.json<ResultType>({
            success: true,
            message: "Password updated successfully.",
            body: null
        }, { status: 200 });
    } catch (error) {
        console.error("Error while updating passwords: ", error);
        return NextResponse.json<ResultType>({
            success: false,
            message: "Something went wrong.",
            body: null
        }, { status: 500 });
    }
}