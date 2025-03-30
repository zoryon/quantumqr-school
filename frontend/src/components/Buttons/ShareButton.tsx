"use client";

import { useState } from "react";

export default function ShareButton({ url, firstName, lastName }: { url: string; firstName?: string; lastName?: string }) {
    const [isCopied, setIsCopied] = useState(false);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${firstName} ${lastName}'s QR Code`,
                    text: `Check out ${firstName} ${lastName}'s contact QR code!`,
                    url: url,
                });
            } catch (err) {
                console.error('Error sharing content:', err);
            }
        } else {
            // Fallback for browsers which do not support navigator.share
            try {
                await navigator.clipboard.writeText(url);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000); // Reset state after 2 seconds
            } catch (err) {
                console.error('Failed to copy link:', err);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="p-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 transition-all transform hover:scale-105"
        >
            <i className="fa-solid fa-share-nodes text-purple-400 text-xl animate-pulse" />
            {isCopied && <span className="ml-2 text-sm text-purple-400">Copied!</span>}
        </button>
    );
}