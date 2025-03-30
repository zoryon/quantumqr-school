import { Metadata } from "next";

export const metadata: Metadata = {
    title: "QuantumQR - ForgotPassword Page",
    description: "Re-Gain access to your QuantumQR account to start generating QR codes.",
};

export default function ForgotPasswordLayout({
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