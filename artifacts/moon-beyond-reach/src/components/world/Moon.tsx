import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { moonVertexShader, moonFragmentShader } from '../../shaders/moonShader';
import { useAudioStore } from '../../stores/audioStore';
import { useExperienceStore } from '../../stores/experienceStore';
import { useTimelineStore } from '../../stores/timelineStore';
import { lerp } from '../../utils/math';

export function Moon() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const incrementMoonTap = useExperienceStore((s) => s.incrementMoonTap);
  const currentAct = useTimelineStore((s) => s.currentAct);
  
  const rippleIntensity = useRef(0);
  
  const uniforms = useMemo(() => ({
    uColor: { value: new THREE.Color('#DDD9E0') },
    uEmissive: { value: new THREE.Color('#DDD9E0') },
    uPulse: { value: 0.0 },
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      // Pulse with bass
      const { bass } = useAudioStore.getState();
      materialRef.current.uniforms.uPulse.value = lerp(
        materialRef.current.uniforms.uPulse.value,
        bass + rippleIntensity.current,
        0.1
      );
      
      // Ripple decay
      rippleIntensity.current = Math.max(0, rippleIntensity.current - 0.05);
    }
    
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      
      // Fade out slightly during dawn
      if (currentAct === 'dawn' && materialRef.current) {
        materialRef.current.transparent = true;
        materialRef.current.opacity = lerp(materialRef.current.opacity, 0.3, 0.01);
      }
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    incrementMoonTap();
    rippleIntensity.current = 2.0; // bright flash on tap
  };

  return (
    <mesh ref={meshRef} onPointerDown={handlePointerDown} position={[0, 0, 0]}>
      <sphereGeometry args={[5, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={moonVertexShader}
        fragmentShader={moonFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
