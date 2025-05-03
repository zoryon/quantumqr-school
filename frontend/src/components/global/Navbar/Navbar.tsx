"use client";

import CreateBtn from "../../Buttons/CreateBtn";
import Logo from "../Logo";
import AccountSettings from "./AccountSettings";
import { useUserData } from "@/hooks/use-user-data";

const Navbar = () => {
    const { userData, isAdmin } = useUserData(); 

    return (
        <>
            <header className="sticky top-0 z-50 bg-gray-800/50 backdrop-blur-xl border-b border-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <Logo />

                        {userData && (
                            <div className="flex items-center gap-4">
                                <AccountSettings userData={userData} isAdmin={isAdmin} />

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