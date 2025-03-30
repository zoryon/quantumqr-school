"use client";

import { motion } from "framer-motion";
import { FEATURES } from "@/constants/landing.constants";
import { cn } from "@/lib/utils";

const FeatureCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="group backdrop-blur-lg border border-white/10 rounded-xl p-6 bg-gradient-to-b from-white/5 to-transparent hover:bg-white/5 transition-all"
    >
        <div className="flex items-center gap-4 mb-4">
            <i className={cn(
                "text-xl text-cyan-400 group-hover:text-purple-400 transition-colors",
                icon
            )} />
            <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
        </div>
        <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
);

const FeaturesShowcase = () => (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-gray-100 mb-4"
                >
                    Quantum Leap in QR Management
                </motion.h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Transform static codes into dynamic experiences with our quantum-powered platform
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {FEATURES.map((feature, index) => {
                    return (
                        <FeatureCard
                            key={feature.title + index}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                        />
                    );
                })}
            </div>
        </div>
    </section>
);

export default FeaturesShowcase;