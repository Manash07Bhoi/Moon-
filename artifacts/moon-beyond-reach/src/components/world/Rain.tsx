import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAudioStore } from '../../stores/audioStore';
import { useTimelineStore } from '../../stores/timelineStore';

const RAIN_COUNT = 1000;

export function Rain() {
  const currentAct = useTimelineStore((s) => s.currentAct);
  const visible = currentAct === 'water' || currentAct === 'grove';

  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Stable dummy — not recreated every render
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Stable args — avoids recreating THREE objects every render
  const meshArgs = useMemo<[THREE.BufferGeometry, THREE.MeshBasicMaterial, number]>(
    () => [new THREE.BufferGeometry(), new THREE.MeshBasicMaterial(), RAIN_COUNT],
    []
  );

  // Drop state persists across renders
  const drops = useRef(
    Array.from({ length: RAIN_COUNT }).map(() => ({
      x: (Math.random() - 0.5) * 100,
      y: Math.random() * 50,
      z: (Math.random() - 0.5) * 100,
      speed: Math.random() * 0.2 + 0.3,
    }))
  );

  useFrame(() => {
    if (!visible || !meshRef.current) return;

    const { treble } = useAudioStore.getState();
    const intensity = 0.5 + treble * 2;

    drops.current.forEach((drop, i) => {
      drop.y -= drop.speed * intensity;

      if (drop.y < -10) {
        drop.y = 50;
        drop.x = (Math.random() - 0.5) * 100;
        drop.z = (Math.random() - 0.5) * 100;
      }

      dummy.position.set(drop.x, drop.y, drop.z);
      dummy.scale.set(0.2, drop.speed * 10 * intensity, 0.2);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <instancedMesh ref={meshRef} args={meshArgs}>
      <boxGeometry args={[0.02, 0.5, 0.02]} />
      <meshBasicMaterial
        color="#DDD9E0"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
