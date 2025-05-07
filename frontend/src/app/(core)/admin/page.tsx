"use client";

import { useUserData } from "@/hooks/use-user-data";
import { useEffect } from "react";

const AdminPage = () => {
    const { userData } = useUserData();

    async function fetchUserList() {
        // TODO
    }

    useEffect(() => {
        fetchUserList();
    }, []);

    return (
        <div>
            <h1>{userData?.username}'s admin page</h1>
            <h2>User list (to ban)</h2>
        </div>
    );
}

export default AdminPage;