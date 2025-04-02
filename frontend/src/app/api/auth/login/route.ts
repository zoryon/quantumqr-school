import getPrismaClient from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { createSignedSessionToken, isLoggedIn } from "@/lib/session";
import { ResultType } from "@/types";

/**
 * Handles the POST request for logging in a user.
 * Validates credentials, checks the user in the database, and sets a session token cookie.
 * 
 * @returns {Promise<NextResponse<ResultType>>} A JSON response indicating whether the login was successful or failed
 */
export async function POST(req: Request): Promise<NextResponse<ResultType>> {
    try {
        if (await isLoggedIn()) {
            // If already logged in, return an error response
            return NextResponse.json<ResultType>({ 
                success: false, 
                message: "You are already logged in",
                body: null
            }, { status: 401 });
        }

        // Proceed with login if the user is not logged in
        const prisma = getPrismaClient();
        const { emailOrUsername, password } = await req.json(); // Extract login credentials from the request body

        // Validate input credentials
        if (typeof emailOrUsername !== "string" || typeof password !== "string" || !emailOrUsername.trim() || !password.trim()) {
            return NextResponse.json<ResultType>({ 
                success: false, 
                message: "Invalid credentials",
                body: null
            }, { status: 400 });
        }

        // Find the user by email or username using Prisma
        const user = await prisma.users.findFirst({
            where: {  
                OR: [
                    { email: emailOrUsername.trim() }, // Match email
                    { username: emailOrUsername.trim() } // Match username
                ],
                isEmailConfirmed: true // Ensure the user's email is confirmed
            }
        });

        // If no user is found, return an invalid credentials error
        if (!user) {
            return NextResponse.json<ResultType>({ 
                success: false, 
                message: "Invalid email or username",
                body: null
            }, { status: 401 });
        }

        // Compare the provided password with the stored hashed password
        const isMatching = await bcrypt.compare(password, user.password);
        if (!isMatching) {
            return NextResponse.json<ResultType>({ 
                success: false, 
                message: "Invalid password",
                body: null
            }, { status: 401 });
        }

        // Create a signed session token for the user
        const newSessionToken = await createSignedSessionToken(user.id);

        // Set a one-week session cookie for the logged-in user
        const expires = new Date();
        expires.setDate(expires.getDate() + 7); // Set expiration to 7 days
        (await cookies()).set("session_token", newSessionToken, {
            httpOnly: true, // Prevents client-side access to the cookie
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            sameSite: "lax", // Prevent cross-site request forgery (CSRF) attacks
            expires,
            path: "/", // Make the cookie available for the entire site
        });

        return NextResponse.json<ResultType>({ 
            success: true, 
            message: "Logged in successfully",
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
