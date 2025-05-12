"use client";

import { api } from "@/lib/endpoint-builder";
import { PublicUser, ResultType } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";

type UserDataContextType = {
    userData: PublicUser | null,
    isPending: boolean,
    isAdmin: () => boolean
};

export const UserDataContext = createContext<UserDataContextType>(null!);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
    const [userData, setUserData] = useState<PublicUser | null>(null);
    const [isPending, setIsPending] = useState<boolean>(true);

    async function fetchUserData() {
        try {
            setIsPending(true);

            const res: ResultType = await fetch(api.users.current.toString(), { method: "GET" }).then((res) => res.json());
            if (!res.success) throw new Error("Failed to fetch current logged-in user");

            setUserData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsPending(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    function isAdmin() {
        return !isPending && userData?.role === "admin";
    }

    return (
        <UserDataContext.Provider value={{
            userData,
            isPending,
            isAdmin
        }}>
            {children}
        </UserDataContext.Provider>
    );
}

export function useUserData() {
    return useContext(UserDataContext);
}