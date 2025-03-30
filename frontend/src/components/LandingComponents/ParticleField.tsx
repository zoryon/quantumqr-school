"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, OrbitControls } from "@react-three/drei";
import * as random from "maath/random";
import { useEffect, useRef, useState } from "react";

const Particles = () => {
    const ref = useRef<any>(null);
    const [sphere] = useState(() =>
        new Float32Array(random.inSphere(new Float32Array(2000 * 3), { radius: 1.5 }))
    );

    useFrame((state, delta) => {
        if (ref.current && state) {
            ref.current.rotation.x += delta / 10;
            ref.current.rotation.y += delta / 15;
        }
    });

    return (
        <points ref={ref}>
            <Points positions={sphere} stride={3}>
                <PointMaterial
                    transparent
                    color="#8A2BE2"
                    size={0.005}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={1}
                />
            </Points>
        </points>
    );
};

const ParticleField = () => {
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        const checkTouch = () => {
            return ("ontouchstart" in window || navigator.maxTouchPoints > 0);
        };
        setIsTouchDevice(checkTouch());
    }, []);

    return (
        <div className={`fixed inset-0 z-0 ${isTouchDevice ? "pointer-events-none" : ""}`}>
            <Canvas camera={{ position: [0, 0, 2] }}>
                <ambientLight intensity={0.5} />
                <Particles />
                {!isTouchDevice && (
                    <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                )}
            </Canvas>
        </div>
    );
};

export default ParticleField;