import getPrismaClient from "@/lib/db";
import transporter, { createSignedResetToken } from "@/lib/mailer";
import { isLoggedIn } from "@/lib/session";
import { ResultType } from "@/types";
import { NextResponse } from "next/server";

/**
 * Handles the POST request for initiating the password reset process.
 * Checks if the user is logged in, validates user credentials, 
 * and sends a password reset email with a link containing a valid token.
 * 
 * @returns {Promise<NextResponse<ResultType>>} A JSON response indicating success or failure with an appropriate message
 */
export async function POST(req: Request): Promise<NextResponse<ResultType>> {
    try {
        if (await isLoggedIn()) {
            // If already logged in, return an error response indicating the user cannot initiate reset while logged in
            return NextResponse.json<ResultType>({
                success: false,
                message: "You are already logged in",
                body: null
            }, { status: 401 });
        }

        // Proceed with the password reset process if the user is not logged in
        const prisma = getPrismaClient();
        const { emailOrUsername } = await req.json(); // Extract email or username from request body

        // Validate the input: check if the email/username is provided and is a valid string
        if (typeof emailOrUsername !== "string" || !emailOrUsername.trim()) {
            return NextResponse.json<ResultType>({
                success: false,
                message: "Invalid credentials",
                body: null
            }, { status: 400 });
        }

        // Find the user by email or username
        const user = await prisma.users.findFirst({
            where: {
                OR: [
                    { email: emailOrUsername.trim() }, // Match by email
                    { username: emailOrUsername.trim() } // Match by username
                ],
                isEmailConfirmed: true // Ensure the user's email is confirmed before proceeding
            }
        });

        // If no user is found, return an error response indicating invalid credentials
        if (!user) {
            return NextResponse.json<ResultType>({
                success: false,
                message: "Invalid email or username",
                body: null
            }, { status: 401 });
        }

        // Generate a signed reset token valid for 10 minutes
        const resetToken = await createSignedResetToken(user.id, "10m")

        // Generate the password reset link containing the token
        const link = `${process.env.WEBSITE_URL}/forgot-password?token=${resetToken}`;

        // Send the password reset email to the user with the reset link
        await transporter.sendMail({
            from: process.env.SMTP_FROM, // The email address from which the reset email is sent
            to: user.email, // Recipient's email address
            subject: "Reset your password", // Email subject
            html: `<p>Reset: <a href="${link}">Click here</a></p>`, // HTML content with the reset link
        });

        return NextResponse.json<ResultType>({
            success: true,
            message: "Please check your email to reset your password.",
            body: true
        }, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json<ResultType>({
            success: false,
            message: error.message,
            body: null
        }, { status: 500 });
    }
}