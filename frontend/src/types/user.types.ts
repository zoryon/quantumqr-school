/**
 * Represents a User in the system.
 * 
 * - `id`: The unique identifier for the user, typically a number.
 * - `email`: The email address of the user.
 * - `username`: The user's chosen username.
 * - `password`: The hashed password for user authentication.
 * - `createdAt`: Date when the user account was created
 * - `tier`: The subscription tier of the user (added from backend response)
 */
export type User = {
    id: number,
    role: "user" | "admin",
    email: string,
    username: string,
    password: string,
    createdAt: Date | null
}

/**
 * Represents a PublicUser with safe-to-expose fields + subscription tier.
 * 
 * - Omits sensitive `id` and `password` fields
 * - Includes `tier` from subscription data
 * - Maintains `createdAt` for profile information
 */
export type PublicUser = Omit<User, "id" | "password"> & {
    tier: string;
    qrCodesCount: number;
    totalScans: number;
};