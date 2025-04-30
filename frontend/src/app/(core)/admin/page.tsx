"use client";

import { useUserData } from "@/hooks/use-user-data";
import NotFound from "../not-found";
import LoadingScreen from "@/components/Loading/LoadingScreen";

const AdminPage = () => {
    const { userData, isPending, isAdmin } = useUserData();

    if (isPending) {
        return <LoadingScreen />;
    }

    if (!isAdmin()) {
        return <NotFound />;
    }

    return (
        <div>
            
        </div>
    );
}

export default AdminPage;