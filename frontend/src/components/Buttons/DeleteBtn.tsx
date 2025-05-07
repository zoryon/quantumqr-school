"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QRCode } from "@/types";
import { useQrCodeList } from "@/hooks/use-qrcode-list";
import { api } from "@/lib/endpoint-builder";
import ConfirmationDialog from "@/components/ConfirmationDialog";

const DeleteBtn = ({
    qrCode,
    isDisabled = false
}: {
    qrCode: QRCode;
    isDisabled?: boolean;
}) => {
    const [isPending, setIsPending] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { setQrCodes, setResult } = useQrCodeList();

    const handleDelete = async () => {
        setIsPending(true);
        setIsDialogOpen(false);

        // Optimistic update
        setQrCodes(prev => prev.filter(code => code.id !== qrCode.id));

        const res = await fetch(api.qrcodes.delete.toString(), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: qrCode.id }),
        });

        if (!res.ok) {
            setResult({
                success: false,
                message: "Failed to delete QR Code.",
                data: null
            });
        } else {
            setResult({
                success: true,
                message: "QR Code deleted successfully.",
                data: null
            });
        }
        setIsPending(false);
    };

    return (
        <>
            <Button
                disabled={isDisabled || isPending}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md text-red-400/80 hover:bg-red-400/10 hover:text-red-400"
                onClick={() => setIsDialogOpen(true)}
            >
                <i className="fas fa-trash-can" />
            </Button>

            <ConfirmationDialog
                isOpen={isDialogOpen}
                onConfirm={handleDelete}
                onCancel={() => setIsDialogOpen(false)}
                title="Delete QR Code"
                message={`Are you sure you want to delete the QR code "${qrCode.name}"? This action cannot be undone.`}
            />
        </>
    );
};

export default DeleteBtn;