import { createHash } from "crypto";
import { useRef } from "react";
import { toast, ExternalToast } from "sonner";

// Interface for the properties required to display a safe toast message
interface SafeToastProps {
    isSuccess: boolean, // Flag indicating whether the toast should indicate success or failure
    options?: ExternalToast // Optional toast options (message, style, duration, etc.)
}

// Interface for generating a unique toast ID, based on description and optional options
interface GenToastIdProps {
    description: string,
    options?: ExternalToast // Optional additional toast options
}

// Custom hook for displaying toasts safely, ensuring uniqueness per message
export const useSafeToast = () => {
    // Use a Set to track the IDs of toasts that have been shown (to avoid duplicates)
    const shownToasts = useRef<Set<string>>(new Set());

    /**
     * Generates a unique hash ID for the toast based on the description and optional options.
     * This ensures that each toast with a specific message and options has a unique identifier.
     * 
     * @param description - The message content for the toast
     * @param options - Additional toast settings (optional)
     * @returns A unique string ID based on the toast content
     */
    const generateToastId = ({ description, options }: GenToastIdProps) => {
        return createHash("md5") // Use MD5 hashing to create a unique ID
            .update(JSON.stringify({ description, options })) // Serialize the description and options to ensure uniqueness
            .digest("hex"); // Return the hash in hexadecimal format
    };

    /**
     * Shows a toast only once based on a unique ID to prevent displaying the same toast repeatedly.
     * If the toast ID has been shown before, it is skipped.
     * 
     * @param isSuccess - Flag indicating whether the toast should be a success or error type
     * @param options - The settings and message for the toast (including description)
     */
    const safeToast = ({ isSuccess, options }: SafeToastProps) => {
        if (!options || !options.description) return null;

        const id = generateToastId({ 
            description: options.description.toString(),  // Generate a unique ID for the toast
            options: options // Include options in the ID generation for uniqueness
        });
        const title = isSuccess ? "Success.." : "An error occurred..";

        // If the toast has not been shown before, show the toast and add the ID to the shown set
        if (!shownToasts.current.has(id)) {
            toast(title, options); // Display the toast with the given title and options
            shownToasts.current.add(id); // Add the toast ID to the set to prevent duplication
        }
    };

    return safeToast;
};

export default useSafeToast;