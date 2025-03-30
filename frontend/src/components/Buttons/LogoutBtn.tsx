"use client";

import { ResultType } from "@/types";
import { useState } from "react";
import { Button } from "../ui/button";
import { api } from "@/lib/endpoint-builder";

const LogoutBtn = () => {
    const [isPending, setIsPending] = useState(false);

    const handleLogout = async () => {
        try {
            setIsPending(true);
            const res: ResultType = await fetch(api.auth.logout.toString(), {
                method: "GET",
            }).then((res) => res.json());

            if (res.success) {
                window.location.href = "/login";
            } else {
                throw new Error(res.message || "Logout failed");
            }
        } catch (error) {
            console.error("Logout failed: ", error);
            setIsPending(false);
        }
    };

    return (
        <Button
            onClick={handleLogout}
            className="w-full text-gray-100"
            variant={"destructive"}
            disabled={isPending}
        >
            {isPending ? "Logging Out..." : "Log Out"}
        </Button>
    );
}

export default LogoutBtn;