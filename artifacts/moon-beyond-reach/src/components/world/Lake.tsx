import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { waterVertexShader, waterFragmentShader } from '../../shaders/waterShader';
import { useAudioStore } from '../../stores/audioStore';
import { useTimelineStore } from '../../stores/timelineStore';

export function Lake() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const currentAct = useTimelineStore((s) => s.currentAct);
  const { gl } = useThree();

  const uniforms = useMemo(() => ({
    uTime: { value: 0.0 },
    uSkyColor: { value: new THREE.Color('#10172B') }, // midnight
    uWaterColor: { value: new THREE.Color('#05060A') }, // void
    uRippleOrigin: { value: new THREE.Vector3(0, 0, 0) },
    uRippleTime: { value: 0.0 },
  }), []);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (currentAct !== 'water' && currentAct !== 'grove' && currentAct !== 'dawn') return;
      
      // Calculate intersection with water plane
      const mouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      
      // We don't have direct access to camera here cleanly for raycasting, 
      // but we can trigger a ripple at center or approximate
      if (materialRef.current) {
        materialRef.current.uniforms.uRippleTime.value = 5.0; // starts high, decays
        // For simplicity, ripple at origin
        materialRef.current.uniforms.uRippleOrigin.value.set(0, -10, 20);
      }
    };
    
    gl.domElement.addEventListener('pointerdown', onPointerDown);
    return () => gl.domElement.removeEventListener('pointerdown', onPointerDown);
  }, [gl, currentAct]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      if (materialRef.current.uniforms.uRippleTime.value > 0) {
        materialRef.current.uniforms.uRippleTime.value -= 0.05;
      }
      
      const { bass } = useAudioStore.getState();
      
      // Rain ripples randomly
      if (currentAct === 'water' && Math.random() > 0.9 - bass * 0.5) {
        // Trigger tiny ripple
        materialRef.current.uniforms.uRippleTime.value = 1.0;
        materialRef.current.uniforms.uRippleOrigin.value.set(
          (Math.random() - 0.5) * 50,
          -10,
          (Math.random() - 0.5) * 50 + 20
        );
      }
    }
  });

  // Only show in specific acts
  const visible = ['water', 'grove', 'dawn'].includes(currentAct);
  
  if (!visible) return null;

  return (
    <mesh position={[0, -10, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[500, 500, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={waterVertexShader}
        fragmentShader={waterFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}
