import ScanIncrementer from "@/components/ScanIncrementer";
import { QR_CODES_TYPES_ARRAY } from "@/constants";
import { api } from "@/lib/endpoint-builder";
import { isQRCodeType } from "@/lib/qrcode";
import { ResultType } from "@/types";
import { notFound } from "next/navigation";

export default async function RedirectPage({
    params: paramsPromise,
}: {
    params: Promise<{ type: string, id: string }>;
}) {
    const params = await paramsPromise;
    const { type, id } = params;
    if (!type || !id) return notFound();

    const normalizedType = QR_CODES_TYPES_ARRAY.find(t => t.toLowerCase() === type.toLowerCase());
    if (!normalizedType || !isQRCodeType(normalizedType)) return notFound();

    const qrCodeId = Number(id);
    if (isNaN(qrCodeId)) return notFound();

    const res: ResultType = await fetch(
        `${process.env.WEBSITE_URL}${api.qrcodes.find.query({ id: qrCodeId, type: normalizedType })}`, {
        method: "GET",
        headers: { "Accept": "application/json" },
    }
    ).then((res) => res.json());

    if (!res || !res.success) return notFound();

    const qrCode = res.body;

    return (
        <>
            <ScanIncrementer qrCodeId={qrCodeId} redirectUrl={qrCode.websiteUrl} />
        </>
    );
}
