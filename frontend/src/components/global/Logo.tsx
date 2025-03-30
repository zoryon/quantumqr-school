import Link from "next/link";

const Logo = () => {
    return (
        <Link href={"/"} className="flex items-center space-x-3">
            <i className="fas fa-qrcode text-xl text-indigo-400 animate-float" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                QuantumQR
            </h1>
        </Link>
    );
}

export default Logo;