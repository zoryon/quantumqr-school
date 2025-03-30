"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const PaintMarkdown = ({ apiPath } : { apiPath: string }) => {
    const [policy, setPolicy] = useState<string>("");

    useEffect(() => {
        fetch(apiPath, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error("Failed to fetch privacy policy");
                }
                return res.json();
            })
            .then(data => setPolicy(data.content));
    }, []);

    return (
        <ReactMarkdown>{policy}</ReactMarkdown>
    );
}

export default PaintMarkdown;