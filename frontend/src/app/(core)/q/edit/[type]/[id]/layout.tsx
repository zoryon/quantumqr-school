import { Metadata } from "next";

export const metadata: Metadata = {
    title: "QuantumQR - Edit Page",
    description: "Edit your QR CODE even after you have shared it with people.",
};

export default function EditVCardLayout({
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