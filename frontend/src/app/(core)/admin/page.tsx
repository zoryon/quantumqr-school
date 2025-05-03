"use client";

import { useUserData } from "@/hooks/use-user-data";
import LoadingScreen from "@/components/Loading/LoadingScreen";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

const AdminPage = () => {
    const { userData, isPending, isAdmin } = useUserData();

    async function handleRequestPromotion() {
        // TODO

    }

    async function fetchUserList() {
        // TODO

    }

    useEffect(() => {
        if (!isAdmin()) return;

        fetchUserList();
    }, [userData, isAdmin]);

    if (isPending) {
        return <LoadingScreen />;
    }

    return isAdmin() ? (
        <div>
            <h1>{userData?.username}'s admin page</h1>
            <h2>User list (to ban)</h2>
        </div>
    ) : (
        <div>
            <h1>Admin page</h1>
            <Button
                variant={"outline"}
                onClick={() => handleRequestPromotion()}
            >
                Request promotion
            </Button>
        </div>
    );
}

export default AdminPage;