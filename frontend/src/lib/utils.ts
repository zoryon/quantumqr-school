import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to combine class names conditionally and ensure no conflicting Tailwind classes
 * are present by merging them.
 * 
 * @param inputs - The class values to be combined and merged
 * @returns A string of combined, merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)); // Merge the class names using tailwind-merge after applying clsx logic
}

/**
 * Utility function to omit specific keys from an object.
 * This creates a shallow copy of the object without the specified keys.
 * 
 * @param obj - The object to omit keys from
 * @param keys - The keys to remove from the object
 * @returns A new object with the specified keys omitted
 */
export function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const newObj = { ...obj }; // Create a shallow copy of the original object
  keys.forEach((key) => delete newObj[key]); // Delete each key specified in the 'keys' array
  return newObj; // Return the new object with the keys removed
}