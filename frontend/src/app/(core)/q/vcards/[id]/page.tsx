"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DownloadButton from "@/components/Buttons/DownloadButton";
import ScanIncrementer from "@/components/ScanIncrementer";
import ShareButton from "@/components/Buttons/ShareButton";
import { ContactPoint, QRCodeTypes, ResultType, VCardResponse } from "@/types";
import Link from "next/link";
import { api } from "@/lib/endpoint-builder";

const type: QRCodeTypes = "vCards";

const VCardPage = () => {
    const params = useParams();
    const id = params.id as string;
    const [qrCode, setQrCode] = useState<VCardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id || isNaN(Number(id))) {
            setError("Invalid QR code ID");
            setLoading(false);
            return;
        }

        const qrCodeId = Number(id);

        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${api.qrcodes.find.query({
                        id: qrCodeId,
                        type: type,
                    })}`,
                    {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                    }
                );

                if (!response.ok) throw new Error("Fetch failed");

                const result: ResultType = await response.json();

                if (result.success) {
                    setQrCode(result.body);
                } else {
                    setError("QR code not found");
                }
            } catch (err) {
                setError("Failed to load QR code data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-indigo-400 animate-pulse">Loading hologram...</div>
            </div>
        );
    }

    if (error || !qrCode) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-red-400">{error || "QR code not found"}</div>
            </div>
        );
    }

    const contactPoints: ContactPoint[] = [
        { icon: "fa-envelope", value: qrCode.email, type: "mailto" },
        { icon: "fa-phone", value: qrCode.phoneNumber, type: "tel" },
        { icon: "fa-map-marker-alt", value: qrCode.address },
        { icon: "fa-globe", value: qrCode.websiteUrl, type: "url" },
    ].filter((item): item is ContactPoint => Boolean(item.value));

    return (
        <div className="min-h-screen bg-gray-900 overflow-hidden relative">
            <ScanIncrementer qrCodeId={qrCode?.id} />

            {/* Dynamic Gradient Background */}
            <div className="absolute inset-0 opacity-40">
                <div className="absolute w-[1200px] h-[1200px] -top-96 -right-96 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full animate-gradient-drift" />
            </div>

            <main className="relative mx-auto max-w-6xl px-4 py-16">
                {/* Holographic Card Container */}
                <div className="group relative rounded-[2.5rem] border border-gray-800 bg-gray-850 backdrop-blur-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden isolate">
                    {/* Interactive Glass Effect */}
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-soft-light" />

                    {/* Floating Particles */}
                    <div className="absolute inset-0 animate-particle-flow">
                        {[...Array(30)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-1 bg-indigo-400/30 rounded-full"
                            />
                        ))}
                    </div>

                    {/* Card Content */}
                    <div className="relative grid grid-cols-1 xl:grid-cols-4 gap-8 p-10">
                        {/* Profile Hologram */}
                        <div className="xl:col-span-1 flex flex-col items-center space-y-8">
                            <div className="relative w-48 h-48 rounded-3xl bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 animate-hologram-glow" />
                                {qrCode.name ? (
                                    <div className="text-center p-4 z-10">
                                        <i className="fas fa-cube text-4xl text-indigo-400/50 mb-3 animate-float" />
                                        <p className="text-sm font-medium text-indigo-400">
                                            {qrCode.name}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent z-10">
                                        {qrCode.firstName?.[0]}
                                        <span className="animate-pulse">·</span>
                                        {qrCode.lastName?.[0]}
                                    </div>
                                )}
                            </div>

                            <div className="text-center space-y-10">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
                                    {qrCode.firstName} <span className="animate-blink">⚡</span>{" "}
                                    {qrCode.lastName}
                                </h1>

                                {/* Social Table */}
                                <div className="flex justify-center space-x-3">
                                    <DownloadButton
                                        url={qrCode.url}
                                        type={qrCode.type}
                                        firstName={qrCode.firstName}
                                        lastName={qrCode.lastName}
                                        icon="fas fa-cloud-arrow-down mr-3"
                                        isShadBtn={false}
                                        className="px-6 py-3 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20 flex items-center cursor-pointer"
                                    />
                                    <ShareButton
                                        url={
                                            process.env.NEXT_PUBLIC_WEBSITE_URL +
                                            `/qrcodes/vcards/${qrCode.qrCodeId}`
                                        }
                                        firstName={qrCode.firstName}
                                        lastName={qrCode.lastName}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Table */}
                        <div className="xl:col-span-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {contactPoints.map((item, index) => (
                                    <div
                                        key={index}
                                        className="p-5 rounded-2xl bg-gray-800/50 hover:bg-gray-800/70 transition-all border-2 border-gray-700/50 hover:border-indigo-500/30 relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-start space-x-4 relative">
                                            <div className="p-3 rounded-xl bg-indigo-500/10 backdrop-blur-sm">
                                                <i className={`fas ${item.icon} text-indigo-400 text-xl`} />
                                            </div>
                                            <div className="flex-1">
                                                {item.type ? (
                                                    <Link
                                                        href={
                                                            item.type !== "url"
                                                                ? `${item.type}:${item.value}`
                                                                : item.value
                                                        }
                                                        target={item.type === "url" ? "_blank" : undefined}
                                                        className="text-lg font-medium text-gray-100 hover:text-indigo-400 transition-colors flex items-center"
                                                    >
                                                        {item.value}
                                                        <i className="fas fa-external-link-alt ml-2 text-sm opacity-70" />
                                                    </Link>
                                                ) : (
                                                    <p className="text-lg font-medium text-gray-100">
                                                        {item.value}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex items-center space-x-2">
                                                    <span className="text-xs font-mono text-indigo-400/70 uppercase tracking-widest">
                                                        {item.icon.split("-")[1]}
                                                    </span>
                                                    <div className="w-2 h-2 bg-indigo-400/30 rounded-full animate-pulse" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Stats Timeline */}
                            <div className="mt-8 p-6 rounded-2xl bg-gray-800/50 border-2 border-gray-700/50 backdrop-blur-sm">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 rounded-xl bg-purple-500/10">
                                        <i className="fas fa-wave-pulse text-purple-400 text-2xl" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-100">
                                            Quantum Stats
                                        </h3>
                                        <div className="flex space-x-6 mt-2">
                                            <div className="text-indigo-400">
                                                <span className="text-2xl font-bold">{qrCode.scans}</span>
                                                <span className="text-sm ml-1">Scans</span>
                                            </div>
                                            <div className="text-purple-400">
                                                <span className="text-2xl font-bold">24h</span>
                                                <span className="text-sm ml-1">Active</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-progress-glow"
                                        style={{ width: "30%" }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Signature */}
            <footer className="mt-12 text-center animate-float">
                <p className="text-sm text-gray-500 font-mono">
                    <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        ▲ QUANTUMQR v1.0
                    </span>{" "}
                    •<span className="mx-2">⚡</span>
                    Powered by Zoryon
                </p>
            </footer>
        </div>
    );
}

export default VCardPage;