import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTimelineStore } from '../../stores/timelineStore';

export function Galaxy() {
  const currentAct = useTimelineStore((s) => s.currentAct);
  const visible = currentAct === 'galaxy';
  const groupRef = useRef<THREE.Group>(null);
  
  const particleCount = 5000;
  
  const particles = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const color1 = new THREE.Color('#8E7FCB'); // yearning
    const color2 = new THREE.Color('#5FE0D8'); // aurora
    const color3 = new THREE.Color('#DDD9E0'); // moon
    
    for (let i = 0; i < particleCount; i++) {
      // Spiral galaxy distribution
      const r = Math.random() * 50;
      const theta = r * 0.5 + Math.random() * Math.PI * 2;
      const spread = Math.exp(-r * 0.1) * 10;
      
      const x = Math.cos(theta) * r + (Math.random() - 0.5) * spread;
      const z = Math.sin(theta) * r + (Math.random() - 0.5) * spread;
      const y = (Math.random() - 0.5) * spread * 0.5;
      
      pos[i*3] = x;
      pos[i*3+1] = y;
      pos[i*3+2] = z;
      
      const mixedColor = [color1, color2, color3][Math.floor(Math.random() * 3)];
      colors[i*3] = mixedColor.r;
      colors[i*3+1] = mixedColor.g;
      colors[i*3+2] = mixedColor.b;
    }
    
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    return geo;
  }, []);

  useFrame((state) => {
    if (groupRef.current && visible) {
      groupRef.current.rotation.y = state.clock.elapsedTime * -0.05;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[10, 10, -20]} rotation={[0.5, 0, 0]}>
      <points geometry={particles}>
        <pointsMaterial 
          size={0.15} 
          vertexColors 
          transparent 
          opacity={0.8} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
