import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isLoggedIn } from "@/lib/session";
import { ResultType } from "@/types";

/**
 * Handles the GET request for logging out the user.
 * If the user is logged in, it deletes the session token from cookies.
 * 
 * @returns {Promise<NextResponse<ResultType>>} A JSON response indicating whether the logout was successful or unauthorized
 */
export async function GET(): Promise<NextResponse<ResultType>> {
    if (!(await isLoggedIn())) {
        // If the user is not logged in, return an unauthorized error response
        return NextResponse.json({
            success: false,
            message: "Not authorized",
            body: null
        }, { status: 401 });
    }

    // Delete the session token from the cookies to log out the user
    (await cookies()).delete("session_token");

    // Return a success response indicating the user has been logged out
    return NextResponse.json({
        success: true,
        message: "Logged out successfully",
        body: true
    }, { status: 200 });
}