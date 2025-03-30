"use client";

import Logo from "../global/Logo";
import LoginBtn from "../Buttons/LoginBtn";

const LandingNavbar = () => {
    return (
        <nav className="fixed w-full z-50 py-3.5 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-8">
                <div className="flex items-center justify-between">
                    <Logo />

                    <div className="flex items-center gap-6">
                        <LoginBtn />
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default LandingNavbar;