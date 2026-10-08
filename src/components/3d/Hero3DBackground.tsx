import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Environment, Center, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface Hero3DBackgroundProps {
  className?: string;
  speed?: number;
}

function RotatingVeelvetLogo({ speed = 0.9 }: { speed?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/assets/logo.glb');

  // Clone scene so materials are clean and isolated
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
          if ('roughness' in mat) (mat as THREE.MeshStandardMaterial).roughness = 0.3;
          if ('metalness' in mat) (mat as THREE.MeshStandardMaterial).metalness = 0.2;
        }
      }
    });
    return clone;
  }, [scene]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Continuous smooth 3D rotation
      groupRef.current.rotation.y += delta * speed;
      // Subtle tilt responsive to cursor
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        state.pointer.y * 0.15,
        0.05
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        -state.pointer.x * 0.15,
        0.05
      );
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.75, 0]} scale={2.0} dispose={null}>
      <Center>
        <primitive object={clonedScene} />
      </Center>
    </group>
  );
}

export function Hero3DBackground({ className = '', speed = 0.9 }: Hero3DBackgroundProps) {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <div className={`absolute inset-0 pointer-events-none flex items-center justify-center opacity-30 ${className}`}>
        <img
          src="/assets/logo-transparent.png"
          alt="Veelvet 3D Star Fallback"
          className="w-96 h-96 object-contain animate-[spin_15s_linear_infinite]"
        />
      </div>
    );
  }

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 select-none ${className}`}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0.1, 4.8], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        onError={() => setHasError(true)}
        className="w-full h-full"
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 8, 6]} intensity={1.6} castShadow />
        <directionalLight position={[-5, -3, -4]} intensity={0.5} />
        <pointLight position={[0, 2.5, 3]} intensity={0.8} />

        <Suspense fallback={null}>
          <Environment preset="studio" />
          <Float speed={2} rotationIntensity={0.25} floatIntensity={0.4}>
            <RotatingVeelvetLogo speed={speed} />
          </Float>
          <ContactShadows
            position={[0, -1.05, 0]}
            opacity={0.35}
            scale={7}
            blur={2.5}
            far={3.5}
            color="#1F2A44"
          />
        </Suspense>
      </Canvas>

      {/* Subtle radial depth gradient ensuring high contrast for centered hero text */}
      <div className="absolute inset-0 bg-radial from-[#f3eee3]/30 via-[#f3eee3]/65 to-[#f3eee3]/95 pointer-events-none" />
    </div>
  );
}

useGLTF.preload('/assets/logo.glb');
