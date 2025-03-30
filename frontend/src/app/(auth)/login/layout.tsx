import { Metadata } from "next";

export const metadata: Metadata = {
    title: "QuantumQR - Login Page",
    description: "Access your QuantumQR account to start generating QR codes.",
};

export default function LoginLayout({
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