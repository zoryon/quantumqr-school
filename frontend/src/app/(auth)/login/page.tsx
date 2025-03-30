import LoginForm from "@/components/Forms/LoginForm";
import Link from "next/link";

const LoginPage = () => {
  return (
    <div className="w-full max-w-md space-y-8">
      <header>
        <div className="text-center">
          <i className="fas fa-qrcode text-6xl text-indigo-400 mb-6 animate-float" />
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Sign in
          </h1>
          <p className="text-gray-400">Welcome Back</p>
        </div>
      </header>

      <main>
        <LoginForm />
      </main>

      <footer className="backdrop-blur-sm">
        <p className="text-center text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Register here
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;