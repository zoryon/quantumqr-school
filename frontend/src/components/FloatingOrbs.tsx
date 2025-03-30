"use client";

import { motion } from "framer-motion";

const FloatingOrbs = () => {
    return (
        <>
            <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute w-72 h-72 bg-purple-700 opacity-20 rounded-full top-16 left-16 blur-3xl"
            />
            <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 5 }}
                className="absolute w-72 h-72 bg-cyan-500 opacity-20 rounded-full bottom-16 right-16 blur-3xl"
            />
        </>
    );
}

export default FloatingOrbs;