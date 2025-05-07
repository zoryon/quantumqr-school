import AdminFirewall from "@/components/AdminFirewall";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "QuantumQR - Admin Page",
    description: "Manage the website.",
};

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {    
    return (
        <AdminFirewall>
            {children}
        </AdminFirewall>
    );
}