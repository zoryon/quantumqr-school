"use client";

import { useQrCodeCreator } from "@/hooks/use-qrcode-creator";
import { useEffect } from "react";
import { Button } from "../ui/button";
import CreateVCardEditor from "../Editors/VCard/CreateVCardEditor";
import QRCodeForm from "../Forms/Create/QRCodeFormRouter";

const Step2 = () => {
    const { handlePrev, qrType, created, reset, isPending } = useQrCodeCreator();

    useEffect(() => {
        if (created !== true) return;

        setTimeout(reset, 1000);
    }, [created]);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-100 mb-2">Configure {qrType}</h1>
                <p className="text-gray-400">Fill in the details for your QR code</p>
            </div>

            <div className="space-y-6">
                {qrType === "vCards" && <CreateVCardEditor />}
                {qrType === "classics" && <QRCodeForm />}
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
                    form={qrType?.toLowerCase() + "-form"}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                    disabled={isPending}
                >
                    Create Code
                    <i className="fas fa-bolt ml-2" />
                </Button>
            </div>
        </div>
    );
};

export default Step2;