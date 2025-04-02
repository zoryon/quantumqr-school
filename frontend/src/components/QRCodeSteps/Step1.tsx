import { QR_CODE_CARDS } from "@/constants";
import { useQrCodeCreator } from "@/hooks/use-qrcode-creator";

const Step1 = () => (
    <div className="space-y-8">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-100 mb-2">Create New Quantum Code</h1>
            <p className="text-gray-400">Select your QR code type to begin</p>
        </div>
        <QRCodesCard />
    </div>
);

const QRCodesCard = () => {
    const { setQrType, handleNext, form } = useQrCodeCreator();

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cons-4 gap-3">
            {QR_CODE_CARDS.map((type, index) => (
                <div
                    key={index}
                    className="group relative bg-gray-700/20 rounded-xl p-5 sm:p-6 cursor-pointer border-2 border-transparent hover:border-indigo-400/30 transition-all"
                    onClick={() => {
                        form.reset();
                        setQrType(type.title);
                        handleNext();
                    }}
                >
                    <div className="flex flex-col items-center text-center">
                        <div className="size-16 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4 transition-all group-hover:bg-indigo-500/20">
                            <i className={`${type.icon} text-2xl text-indigo-400/80`} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-100 mb-2">{type.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-400/80">{type.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Step1;