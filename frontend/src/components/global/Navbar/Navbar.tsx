"use client";

import { PublicUser, ResultType } from "@/types";
import { useEffect, useState } from "react";
import CreateBtn from "../../Buttons/CreateBtn";
import Logo from "../Logo";
import { api } from "@/lib/endpoint-builder";
import AccountSettings from "./AccountSettings";

const Navbar = () => {
    const [userData, setUserData] = useState<PublicUser | null>(null);

    useEffect(() => {
        const fetchSessionUser = async () => {
            try {
                const res: ResultType = await fetch(api.users.current.toString()).then(res => res.json());

                if (!res.success) throw new Error("Failed to fetch user session");

                setUserData(res.body as PublicUser);
            } catch (error) {
                console.error(error);
            }
        };
        fetchSessionUser();
    }, []);

    return (
        <>
            <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Logo />

                        {userData && (
                            <div className="flex items-center gap-4">
                                <AccountSettings userData={userData} />

                                {/* Regular desktop button (hidden on mobile) */}
                                <div className="hidden sm:flex bottom-6 right-6 z-[60]">
                                    <CreateBtn />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile floating button (outside navbar) */}
            <div className="fixed sm:hidden bottom-6 right-6 z-[60]">
                {userData && (<CreateBtn />)}
            </div>
        </>
    );
};

export default Navbar;