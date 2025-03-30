import { Metadata } from "next";

export const metadata: Metadata = {
    title: "QuantumQR - Create Page",
    description: "Generate QR codes.",
};

export default function CreateLayout({
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