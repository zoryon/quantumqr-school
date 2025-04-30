import Link from "next/link";
import { Button } from "../ui/button";
import { motion } from "framer-motion";

const LoginBtn = () => {
    return (
        <Link href="/login">
            <motion.div
                whileHover="hover"
                whileTap="tap"
                className="relative group"
            >
                {/* Glowing background */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400/30 to-purple-500/30 blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Main button */}
                <Button className="rounded-full relative bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-gray-100 hover:text-white font-semibold gap-2 px-8 py-5 transition-all duration-300 overflow-hidden">
                    {/* Quantum energy line */}
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity">
                        <div className="absolute top-0 left-1/4 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-quantum-line" />
                    </div>

                    {/* Pulsing core */}
                    <div className="absolute inset-0 rounded-full border-2 border-white/5 group-hover:border-cyan-400/20 transition-colors" />

                    {/* Content */}
                    <div className="relative z-10 flex items-center gap-5">
                        <span className="relative inline-block">
                            <span className="text-gradient bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
                                Login
                            </span>
                        </span>
                        <i className="fa-solid fa-arrow-right text-xl text-purple-300 group-hover:translate-x-1 transition-transform"></i>
                    </div>

                    {/* Hover shine effect */}
                    <div className="absolute inset-0 overflow-hidden rounded-full">
                        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-r from-white/10 via-white/0 to-white/10 opacity-0 group-hover:opacity-20 group-hover:animate-shine transition-opacity" />
                    </div>
                </Button>
            </motion.div>
        </Link>
    );
};

export default LoginBtn;