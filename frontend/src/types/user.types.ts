/**
 * Represents a User in the system.
 * 
 * - `id`: The unique identifier for the user, typically a number.
 * - `email`: The email address of the user.
 * - `username`: The user's chosen username.
 * - `password`: The hashed password for user authentication.
 */
export type User = {
    id: number, // Unique identifier for the user
    email: string, // User's email address
    username: string, // User's chosen username
    password: string, // User's hashed password (for authentication)
}

/**
 * Represents a PublicUser, which is a version of the `User` type excluding sensitive fields.
 * 
 * - This type omits the `id` and `password` fields from the `User` type.
 * - Useful for situations where you want to expose user data without revealing sensitive information.
 */
export type PublicUser = Omit<User, "id" | "password">;