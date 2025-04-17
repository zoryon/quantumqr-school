"use client";

import { cardDetailsFormSchema, CardDetailsFormValues, classicDetailsFormSchema, ClassicDetailsFormValues } from "@/lib/schemas";
import { QRCodeTypes, DesignOptions, QRCode, ResultType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { useQrCodeList } from "./use-qrcode-list";
import { useRouter } from "next/navigation";
import { api } from "@/lib/endpoint-builder";

// Union type for form values, which can be either for a classic or vCard QR code
export type FormValues =
    ClassicDetailsFormValues &
    CardDetailsFormValues;

// Context type for managing QR code creation state
type QrCreatorContextType = {
    step: number,
    setStep: React.Dispatch<React.SetStateAction<number>>,
    qrType: QRCodeTypes,
    setQrType: React.Dispatch<React.SetStateAction<QRCodeTypes>>,
    designOptions: DesignOptions,
    setDesignOptions: React.Dispatch<React.SetStateAction<DesignOptions>>,
    created: boolean,
    setCreated: React.Dispatch<React.SetStateAction<boolean>>,
    reset: () => void,
    handlePrev: () => void,
    handleNext: () => void,
    isPending: boolean,
    setIsPending: React.Dispatch<React.SetStateAction<boolean>>,
    form: ReturnType<typeof useForm<FormValues>>,
    handleCreate: () => Promise<void>,
}

// Initial values for design options
const initialDesignOptions: DesignOptions = {
    fgColor: "#000000",
    bgColor: "#ffffff",
    logo: null,
    logoScale: 20,
};

// Create a context to share QR code creation state across components
export const QrCreatorContext = createContext<QrCreatorContextType>(null!);

// Provider component to manage and provide QR code creation state
export function QrCreatorProvider({ children }: { children: React.ReactNode }) {
    const { qrCodes, setQrCodes, setResult } = useQrCodeList();
    const router = useRouter();

    const [step, setStep] = useState<number>(1);
    const [qrType, setQrType] = useState<QRCodeTypes>("classics");
    const [created, setCreated] = useState<boolean>(false);
    const [designOptions, setDesignOptions] = useState<DesignOptions>(initialDesignOptions);
    const [isPending, setIsPending] = useState<boolean>(false);

    // Function to get the appropriate schema and default values based on the QR code type
    const getSchemaAndDefaultValues = useCallback(() => {
        const baseDefaults = {
            name: "",
            websiteUrl: "",
            targetUrl: "",
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            address: ""
        };

        switch (qrType) {
            case "classics":
                return {
                    schema: classicDetailsFormSchema,
                    defaultValues: {
                        ...baseDefaults,
                        name: "My Professional Card",
                        targetUrl: "https://company.com"
                    } as ClassicDetailsFormValues
                };
            case "vCards":
                return {
                    schema: cardDetailsFormSchema,
                    defaultValues: {
                        ...baseDefaults,
                        name: "My Professional Card",
                        firstName: "John",
                        lastName: "Doe",
                        email: "john@company.com",
                        phoneNumber: "+1 555 000 0000",
                        address: "123 Main St, City",
                        websiteUrl: "https://company.com"
                    } as CardDetailsFormValues
                };
            // Add more cases here for future QR types
            default:
                throw new Error(`Unsupported qrType: ${qrType}`);
        }
    }, [qrType]); // Recalculate schema and default values when qrType changes

    const { schema, defaultValues } = getSchemaAndDefaultValues();

    // Initialize the form using the schema and default values
    const form = useForm<FormValues>({
        resolver: zodResolver(schema as any) , // Use Zod for form validation
        defaultValues: defaultValues as FormValues // Set the default form values
    });

    // Reset the form whenever qrType changes
    useEffect(() => {
        form.reset(defaultValues);
    }, [qrType]);

    // Function to reset the QR code creation state
    function reset() {
        setCreated(false);
        setQrType("classics");
        setDesignOptions(initialDesignOptions);
        form.reset(defaultValues);
    }

    // Function to move to the previous step, ensuring the step does not go below 1
    const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

    // Function to move to the next step, ensuring the step does not exceed 3
    const handleNext = () => {
        if (step === 1 && !qrType) return null;
        setStep(prev => Math.min(prev + 1, 3));
    };

    async function handleCreate() {
        setIsPending(true);

        // Get form values
        const formValues = form.getValues();

        // Temporary ID for optimistic update
        const tempId = -Date.now();
        const previousQrCodes = [...qrCodes];

        try {
            // Creating a non-accessable temporary QR Code object
            const tempQRCode: QRCode = {
                id: tempId,
                name: (formValues  as ClassicDetailsFormValues).name || "Loading...",
                userId: tempId,
                url: "/gif/loading.gif",
                scans: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                type: qrType as QRCodeTypes,
                qrCodeId: tempId,
                firstName: (formValues as CardDetailsFormValues).firstName,
                lastName: (formValues as CardDetailsFormValues).lastName,
                email: (formValues as CardDetailsFormValues).email || null,
                phoneNumber: (formValues as CardDetailsFormValues).phoneNumber || null,
                websiteUrl: formValues.websiteUrl || null,
                targetUrl: formValues.targetUrl || null,
                address: (formValues as CardDetailsFormValues).address || null,
            };

            // Optimistic update
            setQrCodes([tempQRCode, ...qrCodes]);
            router.push("/");

            // Logo scale is in percentage, so we need to convert it to a decimal value
            designOptions.logoScale = designOptions.logoScale ? designOptions.logoScale / 100 : 0.2;

            // API call to create QR Code
            const res: ResultType = await fetch(api.qrcodes.create.toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    ...formValues, 
                    ...designOptions,
                    qrType, 
                }),
            }).then(res => res.json());

            if (res.success) {
                // Sync temporary QR Code object with the newly created
                setQrCodes(prev => [
                    {
                        ...res.body,
                        type: qrType as QRCodeTypes,
                    },
                    ...prev.filter(qr => qr.id !== tempId)
                ]);
                    setCreated(true);
            } else {
                setQrCodes(previousQrCodes);
            }

            setResult({ 
                success: res.success, 
                message: res.message,
                body: res.body
            });
            setIsPending(false);
        } catch (error: any) {
            console.error("Error during QR code creation: ", error.message);
            setQrCodes(previousQrCodes);
            
            setResult({ 
                success: error.success, 
                message: error.message,
                body: error.body
            });
            setIsPending(false);
        }
    }

    return (
        <QrCreatorContext.Provider value={{
            step, setStep,
            qrType, setQrType,
            designOptions, setDesignOptions,
            created, setCreated,
            reset,
            handlePrev, handleNext,
            isPending, setIsPending,
            form,
            handleCreate,
        }}>
            {children}
        </QrCreatorContext.Provider>
    );
}

// Custom hook to access QR code creation context
export function useQrCodeCreator() {
    return useContext(QrCreatorContext);
}