"use client";

import { api } from "@/lib/endpoint-builder";
import { PublicUser, ResultType } from "@/types";
import { useEffect, useState } from "react";

const UpgradePage = () => {
    const [userData, setUserData] = useState<PublicUser | null>(null);
    
        useEffect(() => {
            const fetchSessionUser = async () => {
                try {
                    const res: ResultType = await fetch(api.users.current.toString()).then(res => res.json());
    
                    if (!res.success) throw new Error("Failed to fetch user session");
    
                    setUserData(res.body as PublicUser);
                } catch (error) {
                    console.error(error);
                }
            };
            fetchSessionUser();
        }, []);

    return userData && (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            UpgradePage
        </div>
    );
}

export default UpgradePage;