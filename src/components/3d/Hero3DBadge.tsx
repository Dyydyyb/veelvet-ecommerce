import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import { VeelvetModel } from './VeelvetModel';
import * as THREE from 'three';

interface Hero3DBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

function RotatingWrapper({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.9;
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

export function Hero3DBadge({ className = '', size = 'md', interactive = true }: Hero3DBadgeProps) {
  const dimensions = {
    sm: 'w-24 h-24 sm:w-28 sm:h-28',
    md: 'w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56',
    lg: 'w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80',
  }[size];

  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <div className={`relative flex items-center justify-center ${dimensions} ${className}`}>
        <img
          src="/assets/logo.png"
          alt="Veelvet 3D Star"
          className="w-3/4 h-auto object-contain animate-[spin_8s_linear_infinite]"
        />
      </div>
    );
  }

  return (
    <div className={`relative ${dimensions} cursor-grab active:cursor-grabbing select-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        onError={() => setHasError(true)}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 5, 4]} intensity={1.4} />
        <directionalLight position={[-3, -2, -2]} intensity={0.4} />

        <Suspense fallback={null}>
          <Float speed={2.5} rotationIntensity={0.4} floatIntensity={0.6}>
            <RotatingWrapper>
              <VeelvetModel speed={0} scale={1.05} />
            </RotatingWrapper>
          </Float>
        </Suspense>

        {interactive && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            maxPolarAngle={Math.PI / 1.7}
            minPolarAngle={Math.PI / 2.3}
          />
        )}
      </Canvas>
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-widest text-navy/40 font-medium pointer-events-none whitespace-nowrap">
        Girá el logo 3D
      </div>
    </div>
  );
}
