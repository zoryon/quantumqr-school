import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "./lib/session";
import { api } from "./lib/endpoint-builder";

/**
 * Middleware function to handle authentication and authorization
 * for both API routes and frontend pages.
 */
export async function middleware(req: NextRequest) {
    // Retrieve the session token from cookies
    const token = req.cookies.get("session_token")?.value;

    // Verify if the session token corresponds to an authenticated user
    const isAuthenticated = await verifySession(token);

    // Extract the current request path
    const { pathname } = req.nextUrl;

    /**
     * ---------------------------
     * API Routes Access Handling
     * ---------------------------
     */
    if (pathname.startsWith("/api")) {
        // API routes accessible only to unauthenticated users
        const unauthenticatedOnlyApi = [
            api.auth.login.toString(),
            api.auth.register.toString(),
            api.auth.register.confirm.toString(),
            api.auth.forgotPassword.sendEmail.toString(),
            api.auth.forgotPassword.reset.toString(),
        ];

        // API routes always accessible to everyone
        const alwaysPublicApi = [
            api.qrcodes.find.toString(),
            api.qrcodes.trackScan.toString(),
            api.policies.toString(),
        ];

        // Check if the current API route is for unauthenticated users only
        const isUnauthenticatedApi = unauthenticatedOnlyApi.some(route => 
            pathname.startsWith(route)
        );

        // Prevent authenticated users from accessing unauthenticated-only API routes
        if (isUnauthenticatedApi) {
            return isAuthenticated 
                ? NextResponse.json({ error: "Already authenticated" }, { status: 403 })
                : NextResponse.next();
        }

        // Allow access to always public API routes
        const isPublicApi = alwaysPublicApi.some(route => 
            pathname.startsWith(route)
        );

        if (isPublicApi) return NextResponse.next();

        // For private API routes, block unauthenticated users
        if (!isAuthenticated) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Allow authenticated users to access private API routes
        return NextResponse.next();
    }

    /**
     * -------------------------------
     * Frontend Pages Access Handling
     * -------------------------------
     */

    // Pages always publicly accessible
    const alwaysPublicPages = [
        "/policies/privacy-policy",
        "/policies/terms-of-service",
    ];

    // Pages intended only for unauthenticated users
    const unauthenticatedOnlyPages = [
        "/landing",
        "/login",
        "/register",
        "/register/confirm",
        "/forgot-password",
    ];

    // Allow access to always public pages
    if (alwaysPublicPages.includes(pathname)) {
        return NextResponse.next();
    }

    // Redirect authenticated users away from unauthenticated-only pages
    if (unauthenticatedOnlyPages.includes(pathname)) {
        return isAuthenticated 
            ? NextResponse.redirect(new URL("/", req.url)) // Redirect to homepage if authenticated
            : NextResponse.next(); // Allow access if unauthenticated
    }

    // Allow access to public QR Code pages except the create page
    if (pathname.startsWith("/q/") && !pathname.startsWith("/q/create") && !pathname.startsWith("/q/edit")) {
        return NextResponse.next();
    }

    /**
     * Allow access to public pages under /r
     * Regex pattern: /r/:type/:id
     * Example: /r/classics/123
     */ 
    if (pathname.match(/^\/r\/[^/]+\/[^/]+\/?$/)) {
        return NextResponse.next();
    }

    // Redirect unauthenticated users trying to access private pages to the landing page
    if (!isAuthenticated) {
        return NextResponse.redirect(new URL("/landing", req.url));
    }

    // Default: allow access if authenticated
    return NextResponse.next();
}

/**
 * Configuration for the middleware matcher
 * Excludes static assets and image files from middleware processing
 */
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};