"use client";

import { cardDetailsFormSchema, CardDetailsFormValues, classicDetailsFormSchema, ClassicDetailsFormValues } from "@/lib/schemas";
import { QRCodeTypes } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useForm } from "react-hook-form";

// Define types for VCard data and design options for the QR code
type DesignOptions = {
    color: string;
    logo: File | null;
};

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
    form: ReturnType<typeof useForm<FormValues>>
}

// Initial values for design options
const initialDesignOptions: DesignOptions = {
    color: "#000000",
    logo: null
};

// Create a context to share QR code creation state across components
export const QrCreatorContext = createContext<QrCreatorContextType>(null!);

// Provider component to manage and provide QR code creation state
export function QrCreatorProvider({ children }: { children: React.ReactNode }) {
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
                        websiteUrl: "https://company.com"
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
        resolver: zodResolver(schema) as any, // Use Zod for form validation
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

    // Function to move to the next step, ensuring the step does not exceed 2
    const handleNext = () => {
        if (step === 1 && !qrType) return null;
        setStep(prev => Math.min(prev + 1, 2));
    };

    return (
        <QrCreatorContext.Provider value={{
            step, setStep,
            qrType, setQrType,
            designOptions, setDesignOptions,
            created, setCreated,
            reset,
            handlePrev, handleNext,
            isPending, setIsPending,
            form
        }}>
            {children}
        </QrCreatorContext.Provider>
    );
}

// Custom hook to access QR code creation context
export function useQrCodeCreator() {
    return useContext(QrCreatorContext);
}