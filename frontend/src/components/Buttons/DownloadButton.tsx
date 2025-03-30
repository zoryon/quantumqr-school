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

        let downloadUrl = url;
        const fileNameBase = (!firstName || !lastName)
            ? type
            : `${firstName}_${lastName}_vCard`;

        try {
            setIsConverting(true);

            if (format !== "svg") {
                downloadUrl = await convertSvgToImage(
                    url,
                    format === "png" ? "png" : "jpeg",
                    1024
                );
            }

            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `${fileNameBase}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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