import { DEFAULT_EXPIRATION, JWT_ALGORITHM } from "@/constants";
import { JWTPayload, jwtVerify, SignJWT } from "jose";
import nodemailer from "nodemailer";

// Interface representing the payload of a JWT token, extending JWTPayload to include the userId.
interface TokenPayload extends JWTPayload {
    userId: number; // User's ID, embedded in the JWT token
}

// Load secret keys for mailer and reset tokens from environment variables.
const mailerSecretKey = new TextEncoder().encode(process.env.MAILER_SECRET!); // Secret key for mailer tokens
const resetSecretKey = new TextEncoder().encode(process.env.RESET_SECRET!); // Secret key for password reset tokens

// Configure the SMTP transporter for sending emails, using environment variables for credentials.
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465, 
    secure: true, // Use SSL/TLS for secure connection
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

// Optional: Verifying the SMTP connection when the server starts.
transporter.verify((error) => {
    if (error) {
        console.error("SMTP connection error: ", error);
    } else {
        console.log("SMTP server is ready to send emails"); // If the connection is successful, log this message
    }
});

// Token generation utility function
/**
 * Creates a signed JWT token for the user.
 * 
 * @param secret - The secret key used to sign the token.
 * @param userId - The ID of the user to be embedded in the token.
 * @param expiration - Optional expiration time for the token (defaults to `DEFAULT_EXPIRATION`).
 * @returns A Promise containing the signed JWT token.
 */
const createToken = async (
    secret: Uint8Array,
    userId: number,
    expiration: string = DEFAULT_EXPIRATION
): Promise<string> => {
    return await new SignJWT({ userId }) // Create a new JWT with the userId payload
        .setProtectedHeader({ alg: JWT_ALGORITHM }) // Set the algorithm to use for signing (e.g., 'HS256')
        .setIssuedAt() // Set the issue time for the token
        .setExpirationTime(expiration)
        .sign(secret); // Sign the token with the secret key
};

// Token validation utility function
/**
 * Validates a JWT token and decodes its payload.
 * 
 * @param secret - The secret key to verify the token.
 * @param token - The token to validate.
 * @returns A Promise with the decoded payload, or `null` if validation fails.
 */
const validateToken = async (
    secret: Uint8Array,
    token?: string
): Promise<TokenPayload | null> => {
    try {
        if (!token) throw new Error("No token provided");

        const { payload } = await jwtVerify(token, secret); // Verify and decode the token
        return payload as TokenPayload; // Return the decoded payload
    } catch (error) {
        console.error(`Token validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return null;
    }
};

// Specific functions for creating and validating confirmation and reset tokens
/**
 * Creates a signed confirmation token for the user.
 * 
 * @param userId - The ID of the user for whom the confirmation token is created.
 * @param expiration - Optional expiration time for the token.
 * @returns A Promise containing the signed confirmation token.
 */
export const createSignedConfirmationToken = (userId: number, expiration?: string) => 
    createToken(mailerSecretKey, userId, expiration);

/**
 * Validates a confirmation token.
 * 
 * @param token - The token to validate.
 * @returns A Promise with the decoded payload or null if validation fails.
 */
export const validateConfirmationToken = (token?: string) => 
    validateToken(mailerSecretKey, token);

/**
 * Creates a signed reset token for the user.
 * 
 * @param userId - The ID of the user for whom the reset token is created.
 * @param expiration - Optional expiration time for the token.
 * @returns A Promise containing the signed reset token.
 */
export const createSignedResetToken = (userId: number, expiration?: string) => 
    createToken(resetSecretKey, userId, expiration);

/**
 * Validates a reset token.
 * 
 * @param token - The token to validate.
 * @returns A Promise with the decoded payload or null if validation fails.
 */
export const validateResetToken = (token?: string) => 
    validateToken(resetSecretKey, token);

export default transporter;