"use client";

import { useQrCodeList } from "@/hooks/use-qrcode-list";
import { QRCode, VCardQRCode } from "@/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import DownloadButton from "@/components/Buttons/DownloadButton";
import DeleteBtn from "@/components/Buttons/DeleteBtn";
import CreateBtn from "@/components/Buttons/CreateBtn";
import EditBtn from "@/components/Buttons/EditBtn";
import { cn } from "@/lib/utils";
import useSafeToast from "@/hooks/use-safe-toast";
import ScanBtn from "@/components/Buttons/ScanBtn";

const HomePage = () => {
  const toast = useSafeToast();
  const { qrCodes, isLoading, result } = useQrCodeList();
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter or transform the qrCodes if needed
  const filteredQRCodes = searchQuery
    ? qrCodes.filter((code) =>
      code.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : qrCodes;

  useEffect(() => {
    if (result) {
      toast({
        isSuccess: result.success,
        options: {
          description: result.message,
          className: cn(result.success ? "bg-green-500" : "bg-red-500", "text-white"),
        }
      });
    }
  }, [result]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-8">
        {/* Title / Subheading */}
        <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
          My QR codes
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          Manage, share and analyze your QR Codes in a simple and modern way.
        </p>

        {/* Search bar (optional) */}
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
          {/* Search bar */}
          <div className="relative w-full max-w-sm ">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for your QRs...."
              className="block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 pr-10 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <i className="fas fa-search absolute right-3 top-2.5 text-gray-500 text-sm" />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <QRCodeListSkeleton />
        ) : filteredQRCodes.length > 0 ? (
          <QRCodeList qrCodes={filteredQRCodes} />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
};

// QRCodeList -> card layout for both mobile and desktop 
const QRCodeList = ({
  qrCodes,
}: {
  qrCodes: QRCode[];
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {qrCodes.map((qrCode) => {
        const isTemp = qrCode.id < 0;

        const createdDate = qrCode.createdAt ? new Date(qrCode.createdAt).toLocaleDateString("it-IT", {
          dateStyle: "medium",
        }) : "Unknown";
        
        const updatedDate = qrCode.updatedAt ? new Date(qrCode.updatedAt).toLocaleDateString("it-IT", {
          dateStyle: "medium",
        }) : "Unknown";

        return (
          <article
            key={qrCode.id}
            className="flex flex-col rounded-xl border border-gray-800 bg-gray-850 p-4 shadow-md transition-all hover:shadow-lg hover:shadow-indigo-500/10"
          >
            {/* Top Row: Checkbox + "vCard"/type + Scans */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">

                {/* Example “type” label; adjust as needed */}
                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-400">
                  {qrCode.type}
                </span>
              </div>
              {/* Example scans count */}
              <span className="text-xs text-gray-500">{qrCode.scans} scans</span>
            </div>

            {/* Middle Row: QR image + Name + Link + Date */}
            <div className="mt-4 flex items-center gap-3">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-700 bg-gray-800">
                <Image
                  src={`data:image/svg+xml;base64,${Buffer.from(qrCode.url).toString("base64")}` || "/gif/loading.gif"}
                  alt={qrCode.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                  unoptimized={true}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="truncate text-sm font-semibold text-gray-100">
                  {qrCode.name}
                </h3>
                <p className="mt-1 truncate text-xs text-gray-400">
                  Updated: {updatedDate}
                </p>
                <p className="mt-1 text-[10px] text-gray-500">
                  Created: {createdDate}
                </p>
              </div>
            </div>

            {/* Bottom Row: Download + Edit/Delete */}
            {/* If temporary QR code, disable the action buttons */}
            <div className="mt-4 flex items-center justify-between">
              <DownloadButton
                url={qrCode.url}
                type={qrCode.type}
                firstName={(qrCode as VCardQRCode).firstName || undefined}
                lastName={(qrCode as VCardQRCode).lastName || undefined}
                icon="fas fa-download mr-2"
                isShadBtn={true}
                isDisabled={isTemp}
                className="rounded-md border-gray-700 text-xs font-medium text-gray-200 hover:border-indigo-500 hover:bg-gray-800 hover:text-indigo-400"
              />
              <div className="flex gap-2">
                <ScanBtn qrCode={qrCode} isDisabled={isTemp} />
                <EditBtn qrCode={qrCode} isDisabled={isTemp} />
                <DeleteBtn qrCode={qrCode} isDisabled={isTemp} />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

// EmptyState
const EmptyState = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
    <div className="relative mb-6">
      <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="relative animate-float">
        <i className="fas fa-qrcode text-7xl text-indigo-400/20" />
      </div>
    </div>
    <h2 className="mb-2 text-xl font-bold text-gray-100 sm:text-2xl">
      You don&apos;t have any QR codes yet
    </h2>
    <p className="mb-6 max-w-md text-sm text-gray-400/90">
      Create a new QR code to start tracking your scans and manage your links securely.
    </p>
   <CreateBtn alwaysDesktop />
  </div>
);

// Skeleton Loader
const QRCodeListSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="animate-pulse flex flex-col rounded-xl border border-gray-800 bg-gray-850 p-4"
      >
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 rounded bg-gray-700" />
          <div className="h-3 w-8 rounded bg-gray-700" />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="relative h-20 w-20 flex-shrink-0 rounded-md bg-gray-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-700" />
            <div className="h-3 w-1/2 rounded bg-gray-700" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="h-8 w-20 rounded bg-gray-700" />
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded bg-gray-700" />
            <div className="h-8 w-8 rounded bg-gray-700" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default HomePage;
