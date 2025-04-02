import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import getPrismaClient from "@/lib/db";
import { isLoggedIn } from "@/lib/session";
import transporter, { createSignedConfirmationToken } from "@/lib/mailer";
import { ResultType } from "@/types";

/**
 * Handles the POST request for user registration.
 * Validates input parameters, hashes the password, checks if the user already exists,
 * creates the user in the database, and sends a confirmation email.
 * 
 * @param req - The incoming HTTP request
 * @returns {Promise<NextResponse<ResultType>>} A JSON response indicating success or failure
 */
export async function POST(req: Request): Promise<NextResponse<ResultType>> {
    try {
        // If user is already logged in, block the registration process
        if (await isLoggedIn()) {
            return NextResponse.json<ResultType>({ 
                success: false,
                message: "You are already logged in.",
                body: null
            }, { status: 401 });
        }

        const prisma = getPrismaClient();

        // Destructuring input values from the request body
        const { email, username, password, passwordConfirmation, hasAllowedEmails } = await req.json();

        // Validating parameters for required types and non-empty values
        if (
            typeof email !== "string" ||
            typeof username !== "string" ||
            typeof password !== "string" ||
            typeof passwordConfirmation !== "string" ||
            typeof hasAllowedEmails !== "boolean" ||
            !email.trim() ||
            !username.trim() ||
            !password.trim() ||
            !passwordConfirmation.trim() ||
            hasAllowedEmails === undefined ||
            hasAllowedEmails === null
        ) {
            return NextResponse.json<ResultType>({ 
                success: false,
                message: "Invalid parameters.",
                body: null
            }, { status: 400 });
        }

        // Username length validation (must be at least 2 characters long)
        if (username.length < 2) {
            return NextResponse.json<ResultType>({ 
                success: false,
                message: "Username must be at least 2 characters long.",
                body: null
            }, { status: 400 });
        }

        // Password length validation (must be at least 5 characters long)
        if (password.length < 5) {
            return NextResponse.json<ResultType>({ 
                success: false,
                message: "Password must be at least 5 characters long.",
                body: null
            }, { status: 400 });
        }

        // Check if password and confirmation password match
        if (password !== passwordConfirmation) {
            return NextResponse.json<ResultType>({ 
                success: false,
                message: "Passwords do not match.",
                body: null
            }, { status: 400 });
        }

        // Checking if the email or username already exists in the database to avoid duplicates
        let user = await prisma.users.findFirst({
            where: {
                OR: [
                    { email: email.trim() },
                    { username: username.trim() }
                ]
            }
        });

        // If user already exists, return an error message
        if (user) {
            return NextResponse.json<ResultType>({ 
                success: false,
                message: "User already exists. Please login instead.",
                body: null
            }, { status: 409 });
        }

        // Hash the password to securely store it in the database
        const hashedPasswd = await bcrypt.hash(password, 10);

        // Create the new user record in the database
        user = await prisma.users.create({
            data: {
                email,
                username,
                password: hashedPasswd,
                hasAllowedEmails: hasAllowedEmails || false, // Default to false if not provided
                isEmailConfirmed: false // Initial email confirmation status is false
            },
        });

        if (!user) {
            return NextResponse.json<ResultType>({ 
                success: false,
                message: "An error occurred on our end. Please try again later.",
                body: null
            }, { status: 500 });
        }

        // Generate a signed email confirmation token that expires in 10 minutes
        const validationToken = await createSignedConfirmationToken(user.id, "10m")
        const link = `${process.env.WEBSITE_URL}/register/confirm?token=${validationToken}`;

        // Send a confirmation email with the generated token link
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: user.email,
            subject: "Confirm Your Email",
            html: `<p>Confirm: <a href="${link}">Click here</a></p>`,
        });

        // Return a success response, informing the user to check their email
        return NextResponse.json<ResultType>({ 
            success: true,
            message: "Registration successful. Please check your email to confirm your account.",
            body: true
        }, { status: 200 });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json<ResultType>({ 
            success: false,
            message: error,
            body: null
        }, { status: 500 });
    }
}