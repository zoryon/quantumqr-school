"use client";

import { api } from "@/lib/endpoint-builder";
import { PublicUser, ResultType } from "@/types";
import { Tier } from "@/types/tier.types";
import { useEffect, useState } from "react";

const UpgradePage = () => {
    const [userData, setUserData] = useState<PublicUser | null>(null);
    const [tiers, setTiers] = useState<Tier[] | null>(null);

    useEffect(() => {
        async function fetchSessionUser() {
            try {
                const res: ResultType = await fetch(api.users.current.toString()).then(res => res.json());

                if (!res.success) throw new Error("Failed to fetch user session");

                setUserData(res.body as PublicUser);
            } catch (error) {
                console.error("Error fetching user data: ", error);
            }
        };

        async function fetchTiers() {
            try {
                const res: ResultType = await fetch(api.subscriptions.tiers.toString()).then(res => res.json());

                if (!res.success) throw new Error("Failed to fetch tiers data");

                setTiers(res.body as Tier[]);
            } catch (error) {
                console.error("Error fetching tiers: ", error);
            }
        };

        fetchSessionUser();
        fetchTiers();
    }, []);

    async function handleUpgrade(tier: Tier) {
        try {
            const res: ResultType = await fetch(api.subscriptions.change.toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: tier.id }),
            }).then(res => res.json());

            alert(res.message);
            window.location.href = "/profile";
        } catch (error) {
            console.error("Error upgrading tier: ", error);
        }
    }

    return (userData && tiers) && (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {tiers.map((tier, i) => {
                return (tier.name !== userData.tier) && (
                    <div key={tier.name + i} className="p-10 border-b border-gray-700">
                        <h2 className="text-lg lg:text-xl font-bold">{tier.name}</h2>
                        <p className="text-sm md:text-base">{tier.description}</p>
                        <p className="text-sm md:text-base">Price: ${tier.price}</p>
                        <button 
                            className="text-sm md:text-base mt-2 bg-blue-500 text-white py-2 px-4 rounded"
                            onClick={() => handleUpgrade(tier)}
                        >
                            Select
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

export default UpgradePage;