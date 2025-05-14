import { QRCode, VCardQRCode } from "@/types";
import DownloadButton from "./Buttons/DownloadButton";
import ScanBtn from "./Buttons/ScanBtn";
import EditBtn from "./Buttons/EditBtn";
import DeleteBtn from "./Buttons/DeleteBtn";
import Image from "next/image";
import { cn } from "@/lib/utils";

const QRCodeList = ({
    qrCodes,
    selectedIds,
    toggleSelection,
    isBatchMode,
}: {
    qrCodes: QRCode[];
    selectedIds: number[];
    toggleSelection: (id: number) => void;
    isBatchMode: boolean;
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
                        className="relative flex flex-col rounded-xl border border-gray-800 bg-gray-850 p-4 shadow-md transition-all hover:shadow-lg hover:shadow-indigo-500/10"
                    >
                        {/* Top Row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {/* Checkbox overlay */}
                                {isBatchMode && (
                                    <div className="">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(qrCode.id)}
                                            onChange={() => toggleSelection(qrCode.id)}
                                            disabled={isTemp}
                                            className={cn(
                                                "form-checkbox h-5 w-5 rounded border-gray-600 bg-gray-700 text-indigo-400 focus:ring-indigo-500 transition-all",
                                                isBatchMode ? 'opacity-100' : 'opacity-0',
                                                isTemp && 'opacity-50 cursor-not-allowed'
                                            )}
                                        />
                                    </div>
                                )}
                                <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-400">
                                    {qrCode.type}
                                </span>
                            </div>
                            <span className="text-xs text-gray-500">{qrCode.scans} scans</span>
                        </div>

                        {/* Middle Row */}
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

                        {/* Bottom Row */}
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

export default QRCodeList;