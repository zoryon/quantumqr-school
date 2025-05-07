/**
 * Represents the structure of a result returned from an operation or API.
 * 
 * - `success`: A boolean indicating whether the operation was successful or not.
 * - `message`: A message providing additional information or details. It could be `null` if there's no message.
 * - `body`: The main content or data returned from the operation. It can be of any type.
 */
export type ResultType = {
    success: boolean; // Indicates whether the operation was successful (true) or failed (false)
    message: string | null; // An optional message, can be null if there's no message
    data: any; // The main data returned, could be any type depending on the context of the operation
};