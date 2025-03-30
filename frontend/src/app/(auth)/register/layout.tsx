import { Metadata } from "next";

export const metadata: Metadata = {
    title: "QuantumQR - Register Page",
    description: "Register for a QuantumQR account to start generating QR codes.",
};

export default function RegisterLayout({
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