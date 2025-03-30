import RegisterForm from "@/components/Forms/RegisterForm";
import Link from "next/link";

const RegisterPage = () => {
  return (
    <div className="w-full max-w-md space-y-8">
      <header>
        <div className="text-center">
          <i className="fas fa-bolt text-6xl text-purple-400 mb-6 animate-pulse" />
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Create Account
          </h1>
          <p className="text-gray-400">Start generating quantum QR codes today</p>
        </div>
      </header>
      
      <main>
        <RegisterForm />
      </main>

      <footer className="backdrop-blur-sm">
        <p className="text-center text-gray-400">
          <span>Already have an account?{" "}</span>
          <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
            Login here
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default RegisterPage;