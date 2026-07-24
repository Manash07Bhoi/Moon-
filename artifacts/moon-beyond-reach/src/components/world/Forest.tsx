import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTimelineStore } from '../../stores/timelineStore';

const FIREFLY_COUNT = 200;

export function Forest() {
  const currentAct = useTimelineStore((s) => s.currentAct);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Stable args — avoids recreating THREE objects every render
  const meshArgs = useMemo<[THREE.BufferGeometry, THREE.MeshBasicMaterial, number]>(
    () => [new THREE.BufferGeometry(), new THREE.MeshBasicMaterial(), FIREFLY_COUNT],
    []
  );

  // Firefly data computed once
  const fireflies = useMemo(() =>
    Array.from({ length: FIREFLY_COUNT }).map(() => ({
      x: (Math.random() - 0.5) * 60,
      y: Math.random() * 20 - 5,
      z: (Math.random() - 0.5) * 60 + 20,
      speed: Math.random() * 0.5 + 0.1,
      offset: Math.random() * Math.PI * 2,
    })),
  []);

  // Tree positions computed once — Math.random() in JSX changes every render
  const treePositions = useMemo(() =>
    Array.from({ length: 15 }).map(() => ({
      x: (Math.random() - 0.5) * 60,
      z: (Math.random() - 0.5) * 30 + 10,
    })),
  []);

  // visible must be declared before useFrame so the closure always captures it
  const visible = currentAct === 'grove';

  useFrame((state) => {
    if (!visible || !meshRef.current) return;

    fireflies.forEach((firefly, i) => {
      const time = state.clock.elapsedTime * firefly.speed + firefly.offset;

      const x = firefly.x + Math.sin(time) * 2;
      const y = firefly.y + Math.cos(time * 0.8) * 2;
      const z = firefly.z + Math.sin(time * 1.2) * 2;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(Math.sin(time * 2) * 0.5 + 0.5);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <group>
      {treePositions.map((pos, i) => (
        <mesh key={i} position={[pos.x, 5, pos.z]}>
          <cylinderGeometry args={[0.5, 0.8, 40, 5]} />
          <meshBasicMaterial color="#05060A" fog={true} />
        </mesh>
      ))}

      <instancedMesh ref={meshRef} args={meshArgs}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#5FE0D8" transparent opacity={0.8} />
      </instancedMesh>
    </group>
  );
}
