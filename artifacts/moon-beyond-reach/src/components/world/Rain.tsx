import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAudioStore } from '../../stores/audioStore';
import { useTimelineStore } from '../../stores/timelineStore';

export function Rain() {
  const currentAct = useTimelineStore((s) => s.currentAct);
  const visible = currentAct === 'water' || currentAct === 'grove';
  
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const RAIN_COUNT = 1000;
  const dummy = new THREE.Object3D();
  
  // Track falling state
  const drops = useRef(Array.from({ length: RAIN_COUNT }).map(() => ({
    x: (Math.random() - 0.5) * 100,
    y: Math.random() * 50,
    z: (Math.random() - 0.5) * 100,
    speed: Math.random() * 0.2 + 0.3
  })));

  useFrame((state) => {
    if (!visible || !meshRef.current) return;
    
    const { treble } = useAudioStore.getState();
    // Intensity scales with treble somewhat
    const intensity = 0.5 + treble * 2;
    
    drops.current.forEach((drop, i) => {
      drop.y -= drop.speed * intensity;
      
      if (drop.y < -10) {
        drop.y = 50;
        drop.x = (Math.random() - 0.5) * 100;
        drop.z = (Math.random() - 0.5) * 100;
      }
      
      dummy.position.set(drop.x, drop.y, drop.z);
      // Stretch drops vertically based on speed
      dummy.scale.set(0.2, drop.speed * 10 * intensity, 0.2);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!visible) return null;

  return (
    <instancedMesh ref={meshRef} args={[new THREE.BufferGeometry(), new THREE.Material(), RAIN_COUNT]}>
      <boxGeometry args={[0.02, 0.5, 0.02]} />
      <meshBasicMaterial color="#DDD9E0" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
    </instancedMesh>
  );
}
