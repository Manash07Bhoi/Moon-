import { useMemo } from 'react';
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  ChromaticAberration,
  Vignette,
  Noise,
} from '@react-three/postprocessing';
import { useDeviceTier } from '../systems/quality/useDeviceTier';
import { Vector2 } from 'three';

export function PostProcessing() {
  const tier = useDeviceTier();

  // Stable Vector2 — avoids creating a new object on every render
  const chromaticOffset = useMemo(() => new Vector2(0.0005, 0.0005), []);

  if (tier === 'efficiency') {
    return (
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={0.5} />
      </EffectComposer>
    );
  }

  if (tier === 'standard') {
    return (
      <EffectComposer>
        <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.9} intensity={1.2} />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
      </EffectComposer>
    );
  }

  // Cinematic — enableNormalPass defaults to false, so no prop needed
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.9} intensity={1.5} />
      <DepthOfField focusDistance={0.01} focalLength={0.02} bokehScale={2} />
      <ChromaticAberration offset={chromaticOffset} />
      <Vignette eskil={false} offset={0.1} darkness={0.8} />
      <Noise premultiply />
    </EffectComposer>
  );
}
