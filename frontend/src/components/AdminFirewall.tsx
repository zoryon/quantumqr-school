"use client";

import { useUserData } from "@/hooks/use-user-data";
import LoadingScreen from "./Loading/LoadingScreen";
import { ResultType } from "@/types";
import { api } from "@/lib/endpoint-builder";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const AdminFirewall = ({ children }: { children: React.ReactNode }) => {
    const { isPending, isAdmin } = useUserData();

    if (isPending) {
        return <LoadingScreen />;
    }

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

    return !isAdmin() ? (
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
    ) : (
        <>
            {children}
        </>
    );
}

export default AdminFirewall;