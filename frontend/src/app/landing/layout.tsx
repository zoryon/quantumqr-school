import { Metadata } from "next";

export const metadata: Metadata = {
    title: "QuantumQR - Landing Page",
    description: "Discover the power of QuantumQR.",
};

export default function LandingLayout({
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