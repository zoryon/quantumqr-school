"use client";

import { useEffect, useState } from "react";
import ScanIncrementer from "@/components/ScanIncrementer";
import { QR_CODES_TYPES_ARRAY } from "@/constants";
import { api } from "@/lib/endpoint-builder";
import { isQRCodeType } from "@/lib/qrcode";
import { ResultType } from "@/types";
import NotFound from "@/app/(core)/not-found";
import { useParams } from "next/navigation";

const RedirectPage = () => {
    const params = useParams();
    const [notFound, setNotFound] = useState(false);
    const [qrCode, setQrCode] = useState<{ targetUrl: string } | null>(null);

    const { type, id } = params;

    useEffect(() => {
        // Validate params
        if (!type || !id) {
            setNotFound(true);
            return;
        }

        // Normalize type
        const normalizedType = QR_CODES_TYPES_ARRAY.find(
            (t) => t.toLowerCase() === (type as string).toLowerCase()
        );
        if (!normalizedType || !isQRCodeType(normalizedType)) {
            setNotFound(true);
            return;
        }

        // Validate ID
        const qrCodeId = Number(id);
        if (isNaN(qrCodeId)) {
            setNotFound(true);
            return;
        }

        // Fetch QR code data
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${api.qrcodes.find.query({
                        id: qrCodeId,
                        type: normalizedType,
                    })}`,
                    {
                        method: "GET",
                        headers: { Accept: "application/json" },
                    }
                );

                const res: ResultType = await response.json();

                if (!res || !res.success) {
                    setNotFound(true);
                } else {
                    setQrCode(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch QR code:", error);
                setNotFound(true);
            }
        };

        fetchData();
    }, [params]);

    if (notFound) {
        return <NotFound/>;
    }

    return qrCode && (
        <ScanIncrementer
            qrCodeId={Number(params.id)}
            redirectUrl={qrCode.targetUrl}
        />
    );
}

export default RedirectPage;