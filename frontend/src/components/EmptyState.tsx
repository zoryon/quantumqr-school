import CreateBtn from "./Buttons/CreateBtn";

const EmptyState = () => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="relative animate-float">
                <i className="fas fa-qrcode text-7xl text-indigo-400/20" />
            </div>
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-100 sm:text-2xl">
            You don&apos;t have any QR codes yet
        </h2>
        <p className="mb-6 max-w-md text-sm text-gray-400/90">
            Create a new QR code to start tracking your scans and manage your links securely.
        </p>
        <CreateBtn alwaysDesktop />
    </div>
);

export default EmptyState;