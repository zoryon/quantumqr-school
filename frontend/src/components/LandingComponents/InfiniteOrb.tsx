"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useEffect } from "react";

const InfiniteOrb = () => {
    const translateX = useMotionValue(0);
    const translateY = useMotionValue(0);
    const scale = useMotionValue(1);
    const background = useMotionTemplate`radial-gradient(40% 40% at ${translateX}px ${translateY}px, rgba(138, 43, 226, 0.1) 0%, transparent 100%)`;

    useEffect(() => {
        const moveOrb = (e: MouseEvent) => {
            // Update positions
            translateX.set(e.clientX);
            translateY.set(e.clientY);
        };

        window.addEventListener("mousemove", moveOrb);
        return () => window.removeEventListener("mousemove", moveOrb);
    }, []);

    return (
        <motion.div
            className="fixed inset-0 pointer-events-none z-0"
            style={{ background }}
        >
            <motion.div
                className="w-24 h-24 rounded-full absolute bg-gradient-to-br from-purple-500 to-blue-500 blur-3xl opacity-30"
                style={{ 
                    translateX, 
                    translateY,
                    scale,
                    transformOrigin: "center"
                }}
                animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "loop"
                }}
            />
        </motion.div>
    );
};

export default InfiniteOrb;