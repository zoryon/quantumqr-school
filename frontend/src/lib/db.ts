import { PrismaClient } from "@prisma/client";

// Declare a variable to hold the PrismaClient instance.
let prisma: PrismaClient;

/**
 * Retrieves the PrismaClient instance, ensuring efficient use in both production and development environments.
 * 
 * - In production, a new instance of `PrismaClient` is created on each call to avoid potential issues with database connections.
 * - In development, a single instance is reused across requests to prevent multiple PrismaClient instances being created, which can improve performance.
 * 
 * @returns The PrismaClient instance.
 */
const getPrismaClient = () => {
    if (process.env.NODE_ENV === "production") {
        // In production, create a new PrismaClient instance every time.
        prisma = new PrismaClient();
    } else {
        // In development, only create a PrismaClient instance once.
        // This prevents new instances from being created on each request, improving performance.
        if (!prisma) {
            prisma = new PrismaClient();
        }
    }

    // Return the PrismaClient instance.
    return prisma;
}

export default getPrismaClient;