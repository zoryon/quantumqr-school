"use client";

import { useQrCodeList } from "@/hooks/use-qrcode-list";
import { notFound, useRouter } from "next/navigation";
import { ResultType, QRCodeTypes } from "@/types";
import { FormValues } from "@/hooks/use-qrcode-creator";
import EditVCardForm from "./EditVCardForm";
import EditClassicForm from "./EditClassicForm";
import { useState } from "react";
import { api } from "@/lib/endpoint-builder";

// This component is used to update the vCards data
// It contains the form to update the vCard data
// The form data is passed to the PreviewCard component to display the live preview
const EditForm = ({ 
    type, 
    id, 
    form, 
    initialData
} : { 
    type: QRCodeTypes, 
    id: number, 
    form?: any,
    initialData: any
}) => {
    const [isPending, setIsPending] = useState<boolean>(false);
    const { qrCodes, setQrCodes, setResult } = useQrCodeList();
    const router = useRouter();

    async function onSubmit(values: FormValues) {
        // optimistic update
        setIsPending(true);

        const previousQrCodes = [...qrCodes];
        try {
            const updatedQrCodes = qrCodes.map(qr => 
                qr.id === id ? { ...qr, ...values } : qr
            );
            setQrCodes(updatedQrCodes);

            router.push("/");

            // API call to update
            const res: ResultType = await fetch(api.qrcodes.update.toString(), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id, type, ...values })
            }).then(res => res.json());

            // Handle successful update
            setResult({
                success: res.success,
                message: res.message,
                data: res.data
            });

            if (res.success) {
                setIsPending(false);
            } else {
                setQrCodes(previousQrCodes);
            }
        } catch (error: any) {
            console.error("Update error: ", error.message);
            setQrCodes(previousQrCodes);
            setResult({
                success: error.success,
                message: error.message,
                data: null
            });
            setIsPending(false);
        }
    }

    switch (type) {
        case "vCards":
            return (
                <EditVCardForm 
                    form={form ? form : undefined} 
                    onSubmit={onSubmit} 
                    isPending={isPending}
                />)
        case "classics":
            return (
                <EditClassicForm 
                    onSubmit={onSubmit} 
                    isPending={isPending} 
                    initialData={initialData} 
                />)
        default:
            return notFound();
    }
}

export default EditForm;