import { z } from "zod";

// Auth schemas

/**
 * Schema for user registration form validation.
 * - Ensures email is valid, username is between 2 and 25 characters, 
 *   and password and passwordConfirmation are of length between 5 and 60 characters.
 * - Ensures that the password matches the passwordConfirmation field.
 */
export const registerFormSchema = z.object({
    email: z.string().email(),
    username: z.string().min(2).max(25),
    password: z.string().min(5).max(60),
    passwordConfirmation: z.string().min(5).max(60),
    hasAllowedEmails: z.boolean(),  // News letters
}).refine(data => data.password === data.passwordConfirmation, {
    message: "Passwords do not match", // Custom error message if passwords don't match
    path: ["passwordConfirmation"] // Error path on the passwordConfirmation field
});

/**
 * Schema for login form validation.
 * - Accepts either an email or a username and ensures the password is valid.
 */
const emailOrUsernameSchema = z.union([
    z.string().email(),
    z.string().min(2).max(25)
]);

/**
 * Schema for login form validation.
 * - Accepts either an email or a username (validated with emailOrUsernameSchema) and 
 *   ensures the password is between 5 and 60 characters.
 */
export const loginFormSchema = z.object({
    emailOrUsername: emailOrUsernameSchema,
    password: z.string().min(5).max(60)
});

/**
 * Schema for the form to send a reset password email.
 * - Accepts either an email or a username.
 */
export const sendResetEmailFormSchema = z.object({
    emailOrUsername: emailOrUsernameSchema,
});

/**
 * Schema for the reset password form validation.
 * - Ensures that the password and passwordConfirmation fields match.
 */
export const resetPasswordFormSchema = z.object({
    password: z.string().min(5).max(60),
    passwordConfirmation: z.string().min(5).max(60),
}).refine(data => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"]
});

// QR Codes schemas

/**
 * Base schema for QR code details with a name field.
 * - Name must be between 2 and 25 characters.
 */
const baseQRCodeSchema = z.object({
    name: z.string().min(2).max(25),
});

/**
 * Schema for classic QR code details.
 * - Inherits from BaseQRCodeSchema and adds a nullable website URL.
 */
export const classicDetailsFormSchema = baseQRCodeSchema.merge(
    z.object({
        name: z.string().min(2).max(25),
        websiteUrl: z.string().url().nullable(),
    })
);

/**
 * Schema for vCard QR code details.
 * - Inherits from BaseQRCodeSchema and adds fields for first name, last name, email, phone number, address, and website URL.
 */
export const cardDetailsFormSchema = baseQRCodeSchema.merge(
    z.object({
        firstName: z.string().min(2).max(25),
        lastName: z.string().min(2).max(25),
        email: z.string().email().nullable(),
        phoneNumber: z.string().min(10).max(15).nullable(),
        address: z.string().min(5).max(50).nullable(),
        websiteUrl: z.string().url().nullable()
    })
);

// Type aliases for inferred form values
export type CardDetailsFormValues = z.infer<typeof cardDetailsFormSchema>;
export type ClassicDetailsFormValues = z.infer<typeof classicDetailsFormSchema>;