"use client";

import { useQrCodeList } from "@/hooks/use-qrcode-list";
import { ResultType } from "@/types";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import useSafeToast from "@/hooks/use-safe-toast";
import QRCodeListSkeleton from "@/components/QRCodeListSkeleton";
import EmptyState from "@/components/EmptyState";
import QRCodeList from "@/components/QRCodeList";
import { api } from "@/lib/endpoint-builder";

const HomePage = () => {
  const toast = useSafeToast();
  const { qrCodes, setQrCodes, isLoading, result, setResult } = useQrCodeList();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);

  const filteredQRCodes = searchQuery
    ? qrCodes.filter((code) =>
      code.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : qrCodes;

  const toggleSelection = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    setSelectedIds([]);
    setIsBatchMode(false);

    const res: ResultType = await fetch(api.qrcodes.delete.toString(), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ids: selectedIds })
    }).then(res => res.json());

    if (res.success) {
      setQrCodes(qrCodes.filter(qrcode => !selectedIds.includes(qrcode.id)));
    }

    setResult({
      success: res.success,
      message: res.message,
      data: null
    });
  };

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
        <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
          My QR codes
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          Manage, share and analyze your QR Codes in a simple and modern way.
        </p>

        {/* Topbar with search feature */}
        <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for your QRs...."
              className="block w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 pr-10 text-sm text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <i className="fas fa-search absolute right-3 top-2.5 text-gray-500 text-sm" />
          </div>

          {/* Button to batch select QR Codes */}
          {!isBatchMode && filteredQRCodes.length > 0 && (
            <button
              onClick={() => setIsBatchMode(true)}
              className="ml-auto flex items-center gap-2 rounded-md border border-indigo-500 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/20"
            >
              <i className="fas fa-layer-group" />
              Select Multiple
            </button>
          )}
        </div>

        {/* Action bar */}
        {isBatchMode && (
          <div className="mb-4 flex items-center justify-between bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const selectableIds = filteredQRCodes
                    .filter(qr => qr.id >= 0)
                    .map(qr => qr.id);
                  setSelectedIds(prev =>
                    prev.length === selectableIds.length ? [] : selectableIds
                  );
                }}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                {selectedIds.length === filteredQRCodes.filter(qr => qr.id >= 0).length ?
                  'Deselect All' :
                  'Select All'}
              </button>
              <span className="text-sm text-gray-200">
                {selectedIds.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                disabled={selectedIds.length === 0}
              >
                Delete Selected
              </button>
            </div>
            <button
              onClick={() => {
                setIsBatchMode(false);
                setSelectedIds([]);
              }}
              className="text-sm text-gray-400 hover:text-gray-300"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <QRCodeListSkeleton />
        ) : filteredQRCodes.length > 0 ? (
          <QRCodeList
            qrCodes={filteredQRCodes}
            selectedIds={selectedIds}
            toggleSelection={toggleSelection}
            isBatchMode={isBatchMode}
          />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
};

export default HomePage;
