"use client";

import { useUserData } from "@/hooks/use-user-data";
import LoadingScreen from "@/components/Loading/LoadingScreen";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { api } from "@/lib/endpoint-builder";
import { ResultType } from "@/types";
import { Input } from "@/components/ui/input";

const AdminPage = () => {
    const { userData, isPending, isAdmin } = useUserData();

    async function handleRequestPromotion(requestReason: string) {
        const res: ResultType = await fetch(api.users.requestPromotion.toString(), {
            method: "POST",
            body: JSON.stringify({ requestReason: requestReason }),
        }).then(res => res.json());

        if (!res.success) {
            console.error("Error", res.message);
        }

        alert(res.message);
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

            <form
                id="request"
                onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.currentTarget.elements.namedItem("requestReason") as HTMLInputElement);
                    handleRequestPromotion(input.value);
                }}
            >
                <Input 
                    id="requestReason" 
                    name="requestReason" 
                    type="text" 
                    className="w-[300px]"
                    required 
                />
                <Button variant={"outline"} type="submit">
                    Request promotion
                </Button>
            </form>
        </div>
    );
}

export default AdminPage;