import { Metadata } from "next";

export const metadata: Metadata = {
    title: "QuantumQR - VCard Page",
    description: "Share your contact information with people all around the world.",
};

export default function VCardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {children}
        </>
    );
}