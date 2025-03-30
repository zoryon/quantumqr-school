"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const HeroSection = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref });
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

    return (
        <section ref={ref} className="relative h-screen flex items-center justify-center pt-20 pointer-events-none">
            <motion.div
                className="text-center z-10 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
            >
                <motion.div
                    className="text-6xl md:text-8xl font-bold mb-8 glitch-text"
                    animate={{
                        textShadow: [
                            "0 0 10px rgba(168,85,247,0.5)",
                            "0 0 20px rgba(103,232,249,0.5)",
                            "0 0 10px rgba(168,85,247,0.5)"
                        ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <motion.span
                        className="bg-gradient-to-r from-quantum-purple to-stellar-blue bg-clip-text text-transparent"
                        animate={{
                            backgroundPositionX: ["0%", "100%", "0%"],
                        }}
                        transition={{ duration: 8, repeat: Infinity }}
                    >
                        EVOLUTION.
                    </motion.span>
                </motion.div>
            </motion.div>

            <motion.div
                className="absolute w-[100vw] h-[100vh] pointer-events-none"
                style={{ y, scale }}
            >
                <div className="quantum-grid-pattern opacity-20" />
            </motion.div>
        </section>
    );
};

export default HeroSection;