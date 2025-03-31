"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import EditForm from "@/components/Forms/Edit/EditFormRouter";
import VCardEditor from "@/components/Editors/VCard/VCardEditor";
import { 
    ClassicResponse, 
    QRCodeTypes, 
    ResultType, 
    VCardResponse 
} from "@/types";
import { api } from "@/lib/endpoint-builder";
import NotFound from "@/app/(core)/not-found";
import { isQRCodeType } from "@/lib/qrcode";
import { QR_CODES_TYPES_ARRAY } from "@/constants";

const EditVCardPage = () => {
    const params = useParams();
    const type = params.type as string;
    const id = params.id as string;

    const [qrCode, setQrCode] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [notFound, setNotFound] = useState<boolean>(false);

    const normalizedType = QR_CODES_TYPES_ARRAY.find(
        (t) => t.toLowerCase() === type.toLowerCase()
    ) as QRCodeTypes;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                if (!type || !id) throw new Error("Missing parameters");
                if (!normalizedType || !isQRCodeType(normalizedType)) {
                    throw new Error("Invalid QR code type");
                }

                const qrCodeId = Number(id);
                if (isNaN(qrCodeId)) throw new Error("Invalid QR code ID");

                const res: ResultType = await fetch(api.qrcodes.find.query({ id: qrCodeId, type: normalizedType }), {
                    method: "GET",
                    headers: { "Accept": "application/json" },
                    credentials: "include",
                }).then((res) => res.json());

                if (!res.success) throw new Error("QR code not found");
                setQrCode(res.body);
            } catch (err) {
                console.error(err);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type, id]);

    useEffect(() => {
        if (qrCode && !qrCode.isOwner) setNotFound(true);
    }, [qrCode]);

    // Handle loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">...</div>
            </div>
        );
    }

    // Handle not found state
    if (notFound) {
        return <NotFound />;
    }

    // Render main content when data is available
    return (
        <div className="min-h-screen bg-gray-900 overflow-hidden relative">
            <div className="absolute inset-0 opacity-40">
                <div className="absolute w-[1200px] h-[1200px] -top-96 -right-96 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full animate-gradient-drift" />
            </div>

            <main className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16">
                <div className="group relative rounded-[2.5rem] border border-gray-800 bg-gray-850/80 backdrop-blur-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden isolate">
                    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                        <RenderEditor type={normalizedType} qrCode={qrCode} />
                    </div>
                </div>
            </main>
        </div>
    );
}

const RenderEditor = ({ type, qrCode }: { type: QRCodeTypes; qrCode: any }) => {
    switch (type) {
        case "vCards":
            return <VCardEditor id={qrCode.id} initialData={qrCode as VCardResponse} />;
        case "classics":
            return <EditForm type={type} id={qrCode.id} initialData={qrCode as ClassicResponse} />;
        default:
            return <div className="text-red-500">Unsupported QR code type</div>;
    }
};

export default EditVCardPage;