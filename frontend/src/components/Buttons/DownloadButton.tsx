"use client";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { QRCodeTypes } from "@/types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { FILE_FORMATS } from "@/constants";
import { convertSvgToImage } from "@/lib/file-utils";

const DownloadButton = ({
    url,
    type,
    firstName,
    lastName,
    icon,
    isShadBtn = false,
    isDisabled = false,
    className
}: {
    url: string;
    type: QRCodeTypes;
    firstName: string | undefined;
    lastName: string | undefined;
    icon: string;
    isShadBtn?: boolean;
    isDisabled?: boolean;
    className: string;
}) => {
    const [isConverting, setIsConverting] = useState<boolean>(false);

    const handleDownload = async (format: "svg" | "png" | "jpg" | "jpeg") => {
        if (isDisabled) return;

        const fileNameBase = (!firstName || !lastName)
            ? type
            : `${firstName}_${lastName}_vCard`;

        try {
            setIsConverting(true);

            if (format === "svg") {
                const svgData = url;
                const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
                const svgUrl = URL.createObjectURL(svgBlob);

                const link = document.createElement("a");
                link.href = svgUrl;
                link.download = `${fileNameBase}.${format}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(svgUrl);
            } else {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const img = new Image();

                img.onload = () => {
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    ctx?.drawImage(img, 0, 0);

                    let dataURL: string | undefined;
                    if (format === "png") {
                        dataURL = canvas.toDataURL("image/png");
                    } else if (format === "jpg" || format === "jpeg") {
                        dataURL = canvas.toDataURL("image/jpeg");
                    }

                    if (dataURL) {
                        const link = document.createElement("a");
                        link.href = dataURL;
                        link.download = `${fileNameBase}.${format}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                    URL.revokeObjectURL(img.src);
                };

                const svgBlob = new Blob([url], { type: "image/svg+xml" });
                img.src = URL.createObjectURL(svgBlob);
            }
        } catch (error) {
            console.error("Download failed: ", error);
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {isShadBtn ? (
                    <Button variant={"outline"} disabled={isDisabled || isConverting}>
                        <div className={cn(className)}>
                            <i className={cn(icon)} />
                            {isConverting ? "Converting..." : "Download"}
                        </div>
                    </Button>
                ) : (
                    <button className={cn(className)} disabled={isDisabled || isConverting}>
                        <i className={cn(icon)} />
                        {isConverting ? "Converting..." : "Download"}
                    </button>
                )}
            </DropdownMenuTrigger>

            <DropdownMenuContent>
                {FILE_FORMATS.map((format) => (
                    <DropdownMenuItem
                        key={format}
                        onSelect={() => handleDownload(format as any)}
                        disabled={isConverting}
                    >
                        {format.toUpperCase()}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default DownloadButton;