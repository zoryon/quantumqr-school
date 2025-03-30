"use client";

import Step1 from "@/components/QRCodeSteps/Step1";
import Step2 from "@/components/QRCodeSteps/Step2";
import Stepper from "@/components/Stepper";
import { useQrCodeCreator } from "@/hooks/use-qrcode-creator";
import { useEffect } from "react";

const CreatePage = () => {
  const { step, reset, setStep } = useQrCodeCreator();

  useEffect(() => {
    reset();
    setStep(1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Colored background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-transparent animate-gradient-pulse" />
      
      <div className="w-full max-w-7xl bg-gray-800/40 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-gray-700/50 relative">
        <Stepper currentStep={step} totalSteps={2} />
        
        <div className="mt-12">
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
        </div>
      </div>
    </div>
  );
};

export default CreatePage;