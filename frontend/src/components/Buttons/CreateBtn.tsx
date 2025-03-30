"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const CreateBtn = ({ alwaysDesktop = false }: { alwaysDesktop?: boolean }) => {
    return (
        <>
            {/* Desktop Version - Visible on sm+ or always if alwaysDesktop */}
            <Link href="/q/create">
                <Button
                    className={cn(
                        `items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-6 
                        py-2.5 font-semibold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] 
                        hover:shadow-indigo-500/30`,
                        alwaysDesktop ? "flex" : "hidden sm:flex"
                    )}
                >
                    <i className="fas fa-plus-circle text-sm" />
                    New Code
                </Button>
            </Link>

            {/* Mobile Version - Hidden when alwaysDesktop is true */}
            <Link href="/q/create">
                <Button
                    className={cn(
                        `h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-0 shadow-2xl 
                        shadow-indigo-500/30 transition-transform hover:scale-110 sm:hidden`,
                        alwaysDesktop && "hidden"
                    )}
                    aria-label="Create new QR code"
                >
                    <i className="fas fa-plus text-lg" />
                </Button>
            </Link>
        </>
    );
}

export default CreateBtn;