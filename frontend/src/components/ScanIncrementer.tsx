"use client";

import { api } from "@/lib/endpoint-builder";
import { useEffect } from "react";

export default function ScanIncrementer({ qrCodeId, redirectUrl }: { qrCodeId: number, redirectUrl?: string }) {
    useEffect(() => {
        fetch(api.qrcodes.scan.toString(), { 
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: qrCodeId }),
        })
            .then((res) => {
                if (!res.ok) console.error("Failed to increment scan count");
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                } 
            })
            .catch((err) => console.error("Scan increment error: ", err));
    }, [qrCodeId]);

    return null;
}