/**
 * Defines the possible types of contact points.
 * - "url": Represents a website or link.
 * - "mailto": Represents an email address.
 * - "tel": Represents a telephone number.
 * - "address": Represents a physical address.
 */
export type ContactPointsType = "url" | "mailto" | "tel" | "address";

/**
 * Represents a contact point with optional categorization.
 * 
 * Properties:
 * - icon (string): Icon identifier or path representing the contact point visually.
 * - value (string): The actual contact information (e.g., URL, email, phone number, address).
 * - type (ContactPointsType, optional): Specifies the type of the contact point (e.g., "url", "mailto").
 */
export type ContactPoint = {
    icon: string;
    value: string;
    type?: ContactPointsType;
};