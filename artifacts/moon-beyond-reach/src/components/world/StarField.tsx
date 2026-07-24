import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { starVertexShader, starFragmentShader } from '../../shaders/starShader';
import { useAudioStore } from '../../stores/audioStore';
import { useTimelineStore } from '../../stores/timelineStore';
import { lerp } from '../../utils/math';

const STAR_COUNT = 3000;

export function StarField() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const currentAct = useTimelineStore((s) => s.currentAct);

  const uniforms = useMemo(() => ({
    uTime: { value: 0.0 },
    uColor: { value: new THREE.Color('#FFFFFF') },
    uBassPulse: { value: 0.0 },
  }), []);

  // Initialize star positions
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const sizes = useMemo(() => new Float32Array(STAR_COUNT), []);
  const phases = useMemo(() => new Float32Array(STAR_COUNT), []);

  useMemo(() => {
    for (let i = 0; i < STAR_COUNT; i++) {
      // Sphere distribution but mostly on upper dome, further away
      const radius = 100 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = Math.abs(radius * Math.cos(phi)) - 10; // Keep mostly above
      const z = radius * Math.sin(phi) * Math.sin(theta);
      
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      
      sizes[i] = Math.random() * 2.0 + 0.5;
      phases[i] = Math.random() * Math.PI * 2;
    }
  }, [dummy, sizes, phases]);

  useFrame((state) => {
    if (materialRef.current) {
      const { bass } = useAudioStore.getState();
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uBassPulse.value = lerp(
        materialRef.current.uniforms.uBassPulse.value,
        bass,
        0.1
      );
    }
    
    // Slow rotation
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.005;
      
      if (currentAct === 'dawn') {
        meshRef.current.position.y += 0.05; // slowly drift away/fade conceptually
      }
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[new THREE.BufferGeometry(), new THREE.ShaderMaterial(), STAR_COUNT]}
    >
      <planeGeometry args={[1, 1]}>
        <instancedBufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <instancedBufferAttribute attach="attributes-aPhase" args={[phases, 1]} />
      </planeGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={starVertexShader}
        fragmentShader={starFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  );
}
