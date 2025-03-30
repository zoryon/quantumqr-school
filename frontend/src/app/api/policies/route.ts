import { PolicyTypes } from "@/types";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import matter from "gray-matter";

// Define the path to the policies directory where markdown files are stored
const POLICIES_PATH = path.join(process.cwd(), "/src/content/policies");

/**
 * Handles the GET request to retrieve a specific policy based on the 'type' query parameter.
 * Fetches the policy file from the server, parses the content and frontmatter, and returns it.
 * 
 * @param req - The incoming HTTP request containing query parameters
 * @returns {Promise<NextResponse>} A JSON response containing the policy content and metadata (lastUpdated date)
 */
export async function GET(req: Request): Promise<NextResponse> {
    // Extract the 'type' query parameter from the request URL
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as PolicyTypes;

    if (!type) {
        return NextResponse.json({ error: "Invalid policy type" }, { status: 400 });
    }

    try {
        // Construct the path to the markdown file based on the provided policy type
        const filePath = path.join(POLICIES_PATH, `${type}.md`);

        // Read the content of the markdown file synchronously
        const fileContent = fs.readFileSync(filePath, "utf-8");

        // Use gray-matter to parse the markdown file into its frontmatter (metadata) and content
        const { data: frontmatter, content } = matter(fileContent);

        // Return a JSON response with the policy's last updated date and content
        return NextResponse.json({
            lastUpdated: frontmatter.lastUpdated, // Metadata from the frontmatter
            content: content, // Markdown content of the policy
        }, {
            headers: {
                // Set caching headers to cache the response for 24 hours
                "Cache-Control": "public, s-maxage=86400", // Cache for 24 hours
                "CDN-Cache-Control": "max-age=86400", // Cache for 24 hours on the CDN
            }
        });
    } catch (error) {
        return NextResponse.json({ error: error }, { status: 404 });
    }
}
