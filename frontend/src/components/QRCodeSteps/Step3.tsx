"use client";

import { Button } from "../ui/button";
import DesignOptionsForm from "../DesignOptionsForm";
import QRCodePreview from "../QRCodePreview";
import { useQrCodeCreator } from "@/hooks/use-qrcode-creator";
import { useEffect } from "react";

const Step3 = () => {
    const { handlePrev, qrType, isPending, created, reset, handleCreate } = useQrCodeCreator();

    useEffect(() => {
        if (created !== true) return;

        setTimeout(reset, 1000);
    }, [created]);

    return (
        <div className="space-y-16 md:p-12 p-0">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-100 mb-2">Customize {qrType}</h1>
                <p className="text-gray-400">Personalize your QR code appearance</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DesignOptionsForm />
                <QRCodePreview />
            </div>

            <div className="flex justify-between">
                <Button
                    variant="ghost"
                    onClick={() => handlePrev()}
                    className="text-gray-400 hover:text-gray-300"
                >
                    <i className="fas fa-arrow-left mr-2" />
                    Back
                </Button>
                <Button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                    disabled={isPending}
                    onClick={() => handleCreate()}
                >
                    Create Code
                    <i className="fas fa-bolt ml-2" />
                </Button>
            </div>
        </div>
    );
};

export default Step3;