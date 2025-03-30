import FloatingOrbs from "@/components/FloatingOrbs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuantumQR - Auth Page",
  description: "Register & Access your QuantumQR account to start generating QR codes.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-screen min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Gradient + Grid Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900 via-black to-blue-900 opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#6b21a8_1px,transparent_1px)] [background-size:25px_25px] opacity-10 pointer-events-none" />
      
      <FloatingOrbs />
      
      {/* Main Content */}
      {children}
    </div>
  );
}