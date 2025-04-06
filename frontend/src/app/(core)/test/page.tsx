"use client";

import { api } from "@/lib/endpoint-builder";
import { ResultType } from "@/types";

const TestPage = () => {
    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault(); // Prevent the default form submission behavior

        const formData = new FormData(e.currentTarget); 
        const data = JSON.stringify(Object.fromEntries(formData)); // Convert FormData to a plain object
        console.log("Data: " + data);

        const res: ResultType = await fetch(api.auth.login.toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: data
        }).then(data => data.json());
        
        if (!res.success) {
            console.error("Error: BOH");
            return null;
        }
        
        console.log("Response: ", res);
    }

    return (
        <div>
            <form onSubmit={(e) => onSubmit(e)} className="w-[40%] mx-auto flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label htmlFor="emailOrUsername">Email or username</label>
                    <input id="emailOrUsername" name="emailOrUsername" type="text" className="text-black" />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="password">Password</label>
                    <input id="password" name="password" type="text" className="text-black" />
                </div>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default TestPage;