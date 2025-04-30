"use client";

import { QRCode } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ScanBtn = ({ qrCode, isDisabled }: { qrCode: QRCode; isDisabled?: boolean }) => {
    function redirect() {
        let ans = "";
        switch (qrCode.type) {
            case "classics":
                ans = `/r/`;
                break;
            case "vCards":
                ans = `/q/`;
                break;
        }
        return ans += `${qrCode.type.toLowerCase()}/${qrCode.id}`;
    }

    return (
        <Link href={redirect()}>
            <Button
                disabled={isDisabled}
                onClick={() => redirect()}
                variant="ghost"
                className="h-8 w-8 rounded-md text-indigo-400/80 hover:bg-indigo-400/10 hover:text-indigo-400"
            >
                <i className="fa-solid fa-arrow-up-right-from-square"></i>
            </Button>
        </Link>
    );
};

export default ScanBtn;