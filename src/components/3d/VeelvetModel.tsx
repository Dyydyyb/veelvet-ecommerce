import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
  speed?: number;
  isFinishing?: boolean;
  scale?: number;
}

export function VeelvetModel({ speed = 1.6, isFinishing = false, scale = 1 }: ModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/assets/logo.glb');

  // Clone scene so multiple canvases (loader & hero) can render it independently
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Enhance materials with luxury navy & metallic sheen
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => enhanceMaterial(m));
          } else {
            enhanceMaterial(mesh.material);
          }
        }
      }
    });
    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      if (isFinishing) {
        // Fast spin burst and scale up during transition
        groupRef.current.rotation.y += delta * 14;
        groupRef.current.scale.lerp(new THREE.Vector3(scale * 1.5, scale * 1.5, scale * 1.5), 0.12);
      } else {
        // Regular continuous elegant spin
        groupRef.current.rotation.y += delta * speed;
      }
    }
  });

  return (
    <group ref={groupRef} scale={scale} dispose={null}>
      <Center>
        <primitive object={clonedScene} />
      </Center>
    </group>
  );
}

function enhanceMaterial(mat: THREE.Material) {
  if ('roughness' in mat) {
    (mat as THREE.MeshStandardMaterial).roughness = 0.35;
  }
  if ('metalness' in mat) {
    (mat as THREE.MeshStandardMaterial).metalness = 0.15;
  }
}

useGLTF.preload('/assets/logo.glb');
