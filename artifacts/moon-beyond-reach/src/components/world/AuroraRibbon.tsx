import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { auroraVertexShader, auroraFragmentShader } from '../../shaders/auroraShader';
import { useAudioStore } from '../../stores/audioStore';
import { useTimelineStore } from '../../stores/timelineStore';
import { lerp } from '../../utils/math';

export function AuroraRibbon() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const currentAct = useTimelineStore((s) => s.currentAct);

  const uniforms = useMemo(() => ({
    uTime: { value: 0.0 },
    uColor1: { value: new THREE.Color('#5FE0D8') }, // aurora
    uColor2: { value: new THREE.Color('#8E7FCB') }, // yearning
    uIntensity: { value: 0.5 },
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      const { treble } = useAudioStore.getState();
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // React to treble
      let targetIntensity = 0.3 + treble * 1.5;
      
      if (currentAct === 'threshold' || currentAct === 'dawn') {
        targetIntensity = 0.0; // fade out
      }
      
      materialRef.current.uniforms.uIntensity.value = lerp(
        materialRef.current.uniforms.uIntensity.value,
        targetIntensity,
        0.05
      );
    }
  });

  // Create a curved ribbon geometry
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(100, 20, 64, 8);
    // bend it
    const pos = geo.attributes.position;
    for(let i=0; i<pos.count; i++) {
      const x = pos.getX(i);
      const z = Math.sin(x * 0.1) * 20.0;
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh position={[0, 20, -50]} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={auroraVertexShader}
        fragmentShader={auroraFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
