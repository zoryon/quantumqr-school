import { PrismaClient } from "@prisma/client";

/**
 * Defines a type `PrismaModel` which is a union of keys from the `PrismaClient` 
 * that correspond to models that have a `findMany` method.
 * 
 * This allows us to dynamically extract only the models that support the `findMany` method.
 * 
 * Explanation:
 * - `keyof PrismaClient`: Retrieves the keys (model names) from the PrismaClient.
 * - `PrismaClient[K] extends { findMany: any }`: Filters out only those models that have a `findMany` method.
 * - `as PrismaClient[K]`: The model names are preserved.
 * 
 * This results in a type that is a union of the Prisma model names that can perform a `findMany` operation.
 */
export type PrismaModel = keyof {
    [K in keyof PrismaClient as PrismaClient[K] extends { findMany: any } ? K : never]: any;
};