"use client";

import { CardDetailsFormValues, ClassicDetailsFormValues } from "@/lib/schemas";
import { FormValues, useQrCodeCreator } from "@/hooks/use-qrcode-creator";
import { useRouter } from "next/navigation";
import { useQrCodeList } from "@/hooks/use-qrcode-list";
import { QRCode, QRCodeTypes, ResultType } from "@/types";
import VCardForm from "./VCardForm";
import ClassicForm from "./ClassicForm";
import { api } from "@/lib/endpoint-builder";

// This component is responsible for rendering the form based on the selected QR Code type.
// It also handles the form submission and optimistic update of the QR Code list.
// It also handles the API call to create the QR Code and updates the QR Code list with the newly created QR Code.
// It also handles the error and success messages and updates the result state accordingly.
// It also handles the loading state of the form.
const QRCodeForm = () => {
    const { qrType, setCreated, setIsPending } = useQrCodeCreator();
    const { qrCodes, setQrCodes, setResult } = useQrCodeList();
    const router = useRouter();

    async function onSubmit(values: FormValues) {
        setIsPending(true);

        // temporary ID for optimistic update
        const tempId = -Date.now();
        const previousQrCodes = [...qrCodes];

        try {
            // creating a non-accessable temporary QR Code object
            const tempQRCode: QRCode = {
                id: tempId,
                name: (values as ClassicDetailsFormValues).name || "Loading...",
                userId: tempId,
                url: "/gif/loading.gif",
                scans: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                type: qrType as QRCodeTypes,
                qrCodeId: tempId,
                firstName: (values as CardDetailsFormValues).firstName,
                lastName: (values as CardDetailsFormValues).lastName,
                email: (values as CardDetailsFormValues).email || null,
                phoneNumber: (values as CardDetailsFormValues).phoneNumber || null,
                websiteUrl: values.websiteUrl || null,
                address: (values as CardDetailsFormValues).address || null,
            };

            // optimistic update
            setQrCodes([tempQRCode, ...qrCodes]);

            router.push("/");

            // API call to create QR Code
            const res = await fetch(api.qrcodes.create.toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...values, qrType }),
            });

            const data: ResultType = await res.json()
            if (data.success) {
                // sync temporary QR Code object with the newly created
                setQrCodes(prev => [
                    {
                        ...data.body,
                        type: qrType as QRCodeTypes,
                    },
                    ...prev.filter(qr => qr.id !== tempId)
                ]);
                    setCreated(true);
            } else {
                setQrCodes(previousQrCodes);
            }

            setResult({ 
                success: data.success, 
                message: data.message,
                body: data.body
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

    switch (qrType) {
        case "classics":
            return (<ClassicForm onSubmit={onSubmit} />);
        case "vCards": 
            return (<VCardForm onSubmit={onSubmit} />);
        default:
            return null;
    }
};

export default QRCodeForm;