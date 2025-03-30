"use client";

import LandingNavbar from "@/components/LandingComponents/LandingNavbar";
import HeroSection from "@/components/LandingComponents/HeroSection";
import ParticleField from "@/components/LandingComponents/ParticleField";
import InfiniteOrb from "@/components/LandingComponents/InfiniteOrb";
import NeonGradient from "@/components/LandingComponents/NeonGradient";
import FeaturesShowcase from "@/components/LandingComponents/FeaturesShowcase";

const LandingPage = () => {
    return (
        <div className="relative min-h-screen overflow-hidden">
            <LandingNavbar />
            <ParticleField />
            <NeonGradient />
            <InfiniteOrb />

            <HeroSection />
            <FeaturesShowcase />
        </div>
    );
};

export default LandingPage;