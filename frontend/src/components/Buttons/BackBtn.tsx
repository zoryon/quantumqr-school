"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

const BackBtn = () => {
    const router = useRouter();

    return (
        <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-4"
        >
            <i className="fa-solid fa-arrow-left text-xl text-red-300" />
        </Button>
    );
}

export default BackBtn;