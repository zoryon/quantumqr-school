import { Feature } from "@/types";

/**
 * FRACTAL_FEATURES: Lists the key features of the "Fractal" plan.
 * Each feature contains:
 * - `title`: A brief title of the feature.
 * - `description`: A short explanation of the feature's functionality.
 * - `icon`: A unique font awesome class for visual differentiation.
 */
export const FEATURES: Feature[] = [
    { 
        title: "Dynamic QR Generation", 
        description: "Create updatable QR codes that evolve with your content. Change destinations instantly without reprinting.", 
        icon: "fa-solid fa-terminal",
    },
    { 
        title: "Real-time Analytics", 
        description: "Track scans with quantum precision. Get location, device, and time analytics in your dashboard.", 
        icon: "fa-solid fa-chart-pie",
    },
    { 
        title: "Custom Branding", 
        description: "Embed logos, colors, and patterns. Maintain brand consistency across all touchpoints.", 
        icon: "fa-solid fa-copyright", 
    },
    { 
        title: "Bulk Management", 
        description: "Generate & manage thousands of QRs in clicks. Perfect for enterprise campaigns.", 
        icon: "fa-solid fa-users",
    },
    { 
        title: "Military-grade Security", 
        description: "Quantum-resistant encryption protects your codes from next-gen threats.", 
        icon: "fa-solid fa-shield-halved",
    },
    { 
        title: "API Integration", 
        description: "Seamless integration with our developer API. Build QR solutions directly into your apps.", 
        icon: "fa-solid fa-globe",
    },
];