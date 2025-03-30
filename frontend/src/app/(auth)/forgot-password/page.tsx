import ForgotPasswordForm from "@/components/Forms/ForgotPasswordForm/ForgotPasswordForm";
import Link from "next/link";

interface PageProps {
    searchParams: Promise<{ token?: string }>
}

const ForgotPasswordPage = async ({ searchParams }: PageProps) => {
    const params = await searchParams;

    return (
        <div className="w-full max-w-md space-y-8">
            <header>
                <div className="text-center">
                    <i className="fas fa-bolt text-6xl text-purple-400 mb-6 animate-pulse" />
                    <h1 className="text-3xl font-bold text-gray-100 mb-2">
                        Forgot Password?
                    </h1>
                    <p className="text-gray-400">Re-gain access to your QuantumQR account</p>
                </div>
            </header>

            <main>
                <ForgotPasswordForm token={params.token} />
            </main>

            <footer className="backdrop-blur-sm">
                <p className="text-center text-gray-400">
                Go back to{" "}
                <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                    Login here
                </Link>
                </p>
            </footer>
        </div>
    );
}

export default ForgotPasswordPage;