"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useQrCodeCreator } from "@/hooks/use-qrcode-creator";
import { useEffect, useMemo, useState } from "react";

const QRCodePreview = () => {
    const { qrType, designOptions, form } = useQrCodeCreator();
    const formValues = form.watch();
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

    // Generate QR data
    const qrData = useMemo(() => {
        switch (qrType) {
            case "classics":
                return formValues.websiteUrl || "";
            case "vCards":
                return `BEGIN:VCARD\nVERSION:3.0\nFN:${formValues.firstName} ${formValues.lastName}\nTEL:${formValues.phoneNumber}\nEMAIL:${formValues.email}\nADR:${formValues.address}\nEND:VCARD`;
            default:
                return "";
        }
    }, [formValues, qrType]);

    // Handle logo file
    useEffect(() => {
        if (designOptions.logo) {
            setLogoDataUrl(designOptions.logo);
        } else {
            setLogoDataUrl(null);
        }
    }, [designOptions.logo]);

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <div className="relative">
                <QRCodeCanvas
                    value={qrData}
                    size={512}
                    bgColor={designOptions.bgColor}
                    fgColor={designOptions.fgColor}
                    level="H"
                    imageSettings={
                        logoDataUrl
                            ? {
                                src: logoDataUrl,
                                height: (designOptions.logoScale / 100) * 512,
                                width: (designOptions.logoScale / 100) * 512,
                                excavate: true,
                            }
                            : undefined
                    }
                    style={{ width: "100%", height: "auto" }}
                />
            </div>
        </div>
    );
};

export default QRCodePreview;