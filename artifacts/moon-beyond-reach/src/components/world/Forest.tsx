import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTimelineStore } from '../../stores/timelineStore';

const FIREFLY_COUNT = 200;

export function Forest() {
  const currentAct = useTimelineStore((s) => s.currentAct);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Basic firefly logic
  const fireflies = useMemo(() => {
    return Array.from({ length: FIREFLY_COUNT }).map(() => ({
      x: (Math.random() - 0.5) * 60,
      y: Math.random() * 20 - 5,
      z: (Math.random() - 0.5) * 60 + 20,
      speed: Math.random() * 0.5 + 0.1,
      offset: Math.random() * Math.PI * 2
    }));
  }, []);

  useFrame((state) => {
    if (meshRef.current && visible) {
      fireflies.forEach((firefly, i) => {
        const time = state.clock.elapsedTime * firefly.speed + firefly.offset;
        
        // Gentle wandering
        const x = firefly.x + Math.sin(time) * 2;
        const y = firefly.y + Math.cos(time * 0.8) * 2;
        const z = firefly.z + Math.sin(time * 1.2) * 2;
        
        dummy.position.set(x, y, z);
        dummy.scale.setScalar(Math.sin(time * 2) * 0.5 + 0.5); // pulse
        dummy.updateMatrix();
        meshRef.current?.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const visible = currentAct === 'grove';
  if (!visible) return null;

  return (
    <group>
      {/* Trees could be simple cylinders or cards, keeping it very abstract/minimal */}
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh key={i} position={[(Math.random() - 0.5) * 60, 5, (Math.random() - 0.5) * 30 + 10]}>
          <cylinderGeometry args={[0.5, 0.8, 40, 5]} />
          <meshBasicMaterial color="#05060A" fog={true} />
        </mesh>
      ))}
      
      {/* Fireflies */}
      <instancedMesh ref={meshRef} args={[new THREE.BufferGeometry(), new THREE.Material(), FIREFLY_COUNT]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#5FE0D8" transparent opacity={0.8} />
      </instancedMesh>
    </group>
  );
}
