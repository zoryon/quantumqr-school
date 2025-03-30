"use client";

import { motion, useMotionTemplate, useTime } from "framer-motion";

const NeonGradient = () => {
    const time = useTime();
    const x = useMotionTemplate`${Math.sin(time.get() / 1000) * 100}%`;
    const y = useMotionTemplate`${Math.cos(time.get() / 1000) * 100}%`;

    return (
        <motion.div
            className="fixed inset-0 pointer-events-none z-0"
            style={{
                background: useMotionTemplate`radial-gradient(at ${x} ${y}, 
          rgba(138,43,226,0.15) 0%,
          rgba(0,0,0,0) 50%
        )`,
            }}
        />
    );
};

export default NeonGradient;