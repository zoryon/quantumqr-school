import { cardDetailsFormSchema, CardDetailsFormValues, classicDetailsFormSchema, ClassicDetailsFormValues } from "@/lib/schemas";
import { QRCodeTypes, ResultType } from "@/types";
import { NextResponse } from "next/server";
import getPrismaClient from "@/lib/db";
import { verifySession } from "@/lib/session";
import { cookies } from "next/headers";
import { generateQRCode } from "@/lib/qrcode";
import { ROUTER_URL } from "@/constants";

const prisma = getPrismaClient();

/**
 * Handles POST requests to create a QR code.
 * Verifies the user's session and processes QR code creation based on the QR type.
 * 
 * @param req - The incoming request object containing the QR code data.
 * @returns {Promise<NextResponse<ResultType>>} A JSON response indicating success or failure with the created QR code or error message.
 */
export async function POST(req: Request): Promise<NextResponse<ResultType>> {
    try {
        // Retrieve session token from cookies and verify if the user is logged in
        const sessionToken = (await cookies()).get("session_token")?.value;
        const session = await verifySession(sessionToken);

        // If the session is invalid or no user is logged in, return a 401 Unauthorized response
        if (!session?.userId) {
            return NextResponse.json<ResultType>({
                success: false,
                message: "You are not logged in",
                body: null
            }, { status: 401 });
        }

        // Parse the request body, separating qrType (QR type) from the rest of the QR data
        const {
            qrType,
            ...values
        } = await req.json();

        if (!qrType.trim()) {
            return NextResponse.json<ResultType>({ 
                success: false, 
                message: "Invalid input",
                body: null
            }, { status: 400 });
        }

        // Validate the length of the name field (it should not exceed 20 characters)
        if (values.name.trim().length > 20) {
            return NextResponse.json<ResultType>({ 
                success: false, 
                message: "Name must be less than 20 characters",
                body: null
            }, { status: 400 });
        }

        // Define variables to hold the QR code and parsed values
        let qrCode: any = null;
        let parsedValues: any = null;

        // Switch based on the QR type (either vCards or classics)
        switch (qrType as QRCodeTypes) {
            case "vCards":
                // Parse the vCard data using a schema for validation
                parsedValues = cardDetailsFormSchema.safeParse(values);

                // If parsing fails, return a 400 Bad Request response with the error message
                if (!parsedValues.success) {
                    return NextResponse.json<ResultType>({ 
                        success: false, 
                        message: parsedValues.error.message,
                        body: null
                    }, { status: 400 });
                }

                // Create a vCard QR code using the parsed values
                qrCode = await createVCardQRCode({
                    userId: session.userId as number,
                    values: parsedValues.data
                });
                break;
            case "classics":
                parsedValues = classicDetailsFormSchema.safeParse(values);

                if (!parsedValues.success) {
                    return NextResponse.json<ResultType>({ 
                        success: false, 
                        message: parsedValues.error.message,
                        body: null
                    }, { status: 400 });
                }

                qrCode = await createClassicQRCode({
                    userId: session.userId as number,
                    values: parsedValues.data
                });
                break;
            default:
                // If qrType is neither "vCards" nor "classics", return a 400 Bad Request response
                return NextResponse.json<ResultType>({ 
                    success: false, 
                    message: "Invalid QR code type",
                    body: null
                }, { status: 400 });
        }

        return NextResponse.json<ResultType>({
            success: true,
            message: "QR code created successfully",
            body: qrCode
        }, { status: 200 });
    } catch (error: any) {
        console.error(error.message);
        return NextResponse.json<ResultType>({
            success: error.success,
            message: error.message,
            body: null
        }, { status: 500 });
    }
}

/**
 * Creates a vCard QR code, validates the input, and stores it in the database.
 * 
 * @param userId - The ID of the user creating the QR code
 * @param values - The vCard details for the QR code
 * @returns The saved QR code entry with the generated URL
 */
async function createVCardQRCode({
    userId,
    values
}: {
    userId: number,
    values: CardDetailsFormValues
}) {
    try {
        // Check if a QR code with the same name already exists for the user
        const existingQrCode = await prisma.qrcodes.findFirst({
            where: { userId, name: values.name }
        });
        
        if (existingQrCode) {
            throw new Error("A QR Code with the same name already exists");
        }

        // Create the QR code entry in the database for a vCard
        const qrCode = await prisma.qrcodes.create({
            data: {
                name: values.name,
                userId: userId,
                url: "", // URL will be populated later
                vcardqrcodes: {
                    create: {
                        firstName: values.firstName,
                        lastName: values.lastName,
                        phoneNumber: values.phoneNumber,
                        email: values.email,
                        address: values.address,
                        websiteUrl: values.websiteUrl,
                    }
                }
            },
            include: { vcardqrcodes: true }
        });

        // Generate a dynamic URL for the QR code
        const dynamicURL = `${process.env.WEBSITE_URL!}/q/vcards/${qrCode.id}`;

        // Generate the QR Code URL
        const qrCodeURL = await generateQRCode(dynamicURL);

        // Update the QR code entry with the generated URL
        const updatedQrCode = await prisma.qrcodes.update({
            where: { id: qrCode.id },
            data: { url: qrCodeURL },
            include: { vcardqrcodes: true }
        });

        // Return the updated QR code entry
        return updatedQrCode;
    } catch (error: any) {
        console.error("Error generating or saving QR code: ", error);
        throw error;
    }
}

/**
 * Creates a classic QR code (URL-based), validates the input, and stores it in the database.
 * 
 * @param userId - The ID of the user creating the QR code
 * @param values - The details for the classic QR code, such as the website URL
 * @returns The saved QR code entry with the generated URL
 */
async function createClassicQRCode({
    userId,
    values
}: {
    userId: number,
    values: ClassicDetailsFormValues
}) {
    try {
        // Ensure that a website URL is provided for the classic QR code
        if (!values.websiteUrl) {
            throw new Error("Website URL is required");
        }

        // Check if a QR code with the same name already exists for the user
        const existingQrCode = await prisma.qrcodes.findFirst({
            where: { userId, name: values.name }
        });
        
        if (existingQrCode) {
            throw new Error("A QR Code with the same name already exists");
        }
        
        // Create the QR code entry in the database for a classic QR code
        const qrCode = await prisma.qrcodes.create({
            data: {
                name: values.name,
                userId: userId,
                url: "", // URL will be populated later
                classicqrcodes: {
                    create: {
                        websiteUrl: values.websiteUrl, // Store the website URL in the database
                    }
                }
            },
            include: { classicqrcodes: true }
        });

        // Generate the QR Code URL
        const url = `${ROUTER_URL}/classics/${qrCode.id}`; 
        
        const qrCodeBase64 = await generateQRCode(url);

        // Update the QR code entry with the generated URL
        const updatedQrCode = await prisma.qrcodes.update({
            where: { id: qrCode.id },
            data: { url: qrCodeBase64 },
            include: { classicqrcodes: true }
        });

        // Return the created QR code entry
        return updatedQrCode;
    } catch (error: any) {
        console.error("Error generating or saving QR code: ", error);
        throw error;
    }
}