const Stepper = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
    <div className="flex items-center justify-between relative mb-12">
        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-700/50 -translate-y-1/2" />
        {[...Array(totalSteps)].map((_, i) => (
            <div key={i} className="relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${i + 1 <= currentStep
                        ? "bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20"
                        : "bg-gray-700/50"
                    }`}>
                    <span className={`font-bold ${i + 1 <= currentStep ? "text-gray-100" : "text-gray-400"}`}>
                        {i + 1}
                    </span>
                </div>
            </div>
        ))}
    </div>
);

export default Stepper;