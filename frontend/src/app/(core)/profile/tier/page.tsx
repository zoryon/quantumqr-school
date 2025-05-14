"use client";

import { useUserData } from "@/hooks/use-user-data";
import { api } from "@/lib/endpoint-builder";
import { ResultType } from "@/types";
import { Tier } from "@/types/tier.types";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, BadgeCheck, CreditCard, CalendarClock } from "lucide-react";

const UpgradePage = () => {
    const { userData } = useUserData();
    const [tiers, setTiers] = useState<Tier[] | null>(null);
    const [currentTier, setCurrentTier] = useState<Tier | null>(null);

    useEffect(() => {
        async function fetchTiers() {
            try {
                const res: ResultType = await fetch(api.subscriptions.tiers.toString()).then(res => res.json());
                if (!res.success) throw new Error("Failed to fetch tiers data");

                const allTiers = res.data as Tier[];
                setTiers(allTiers);
                setCurrentTier(allTiers.find(t => t.name === userData?.tier) || null);
            } catch (error) {
                console.error("Error fetching tiers: ", error);
            }
        }
        if (userData) fetchTiers();
    }, [userData]);

    async function handleSubscriptionChange(tier: Tier) {
        if (tier.name === currentTier?.name) return;

        try {
            const res: ResultType = await fetch(api.subscriptions.change.toString(), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: tier.id }),
            }).then(res => res.json());

            if (res.success) {
                window.location.reload();
            } else {
                console.error(res.message);
                alert(res.message);
            }
        } catch (error) {
            console.error("Error changing subscription: ", error);
        }
    }

    if (!userData || !tiers) return null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Current Plan Section */}
                {currentTier && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16 bg-gray-800 rounded-2xl p-8 shadow-xl"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <BadgeCheck className="text-indigo-500" />
                                    Current Plan: {currentTier.name}
                                </h2>
                                <p className="text-gray-400 mt-2">
                                    {currentTier.price > 0 ? (
                                        <>${currentTier.price} /month</>
                                    ) : (
                                        "Free forever plan"
                                    )}
                                </p>
                            </div>

                            <div className="mt-4 md:mt-0 space-x-4">
                                {currentTier.price > 0 && (
                                    <button
                                        className="text-red-500 hover:text-red-400"
                                        onClick={() => handleSubscriptionChange(tiers.find(t => t.name === 'Free')!)}
                                    >
                                        Cancel Subscription
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Available Plans */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
                        {currentTier?.price === 0 ? "Upgrade Your Plan" : "Manage Subscription"}
                    </h1>
                    <p className="mt-4 text-xl text-gray-300">
                        {currentTier?.price === 0
                            ? "Unlock premium features with our paid plans"
                            : "Change or modify your subscription"}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
                    {tiers.map((tier, i) => {
                        if (tier.name === "Free") return null; 

                        return (
                            <motion.div
                                key={tier.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative bg-gray-800 rounded-2xl p-8 shadow-xl transition-all ${tier.name === currentTier?.name
                                    ? "ring-2 ring-indigo-500"
                                    : "hover:ring-2 ring-gray-700 hover:ring-indigo-500"
                                    }`}
                            >
                                {tier.name === currentTier?.name && (
                                    <div className="absolute top-4 right-4 bg-indigo-500 text-white px-3 py-1 rounded-full text-sm">
                                        Current Plan
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                                    <p className="text-gray-400">{tier.description}</p>
                                </div>

                                <div className="flex items-baseline mb-8">
                                    <span className="text-4xl font-extrabold text-white">
                                        ${tier.price}
                                    </span>
                                    <span className="text-gray-400 ml-2">
                                        /{tier.price == 0 ? 'forever' : 'month'}
                                    </span>
                                </div>

                                {tier.name !== currentTier?.name ? (
                                    <button
                                        onClick={() => handleSubscriptionChange(tier)}
                                        className="w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
                                    >
                                        {currentTier?.price === 0 ? 'Upgrade Now' : 'Change Plan'}
                                        <ChevronRight className="w-5 h-5 ml-2" />
                                    </button>
                                ) : (
                                    <div className="text-center py-4 text-gray-400">
                                        Your current plan
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default UpgradePage;