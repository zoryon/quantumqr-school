import Navbar from "@/components/global/Navbar/Navbar";
import Providers from "@/components/Providers";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "QuantumQR - Home Page",
    description: "Generate & Manage QR codes.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Providers>
            <Navbar />
            {children}
        </Providers>
    );
}