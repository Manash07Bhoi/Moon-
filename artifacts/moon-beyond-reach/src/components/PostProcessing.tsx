import { EffectComposer, Bloom, DepthOfField, ChromaticAberration, Vignette, FilmGrain } from '@react-three/postprocessing';
import { useDeviceTier } from '../systems/quality/useDeviceTier';
import { BlendFunction } from '@react-three/postprocessing';
import { Vector2 } from 'three';

export function PostProcessing() {
  const tier = useDeviceTier();

  if (tier === 'efficiency') {
    return (
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={0.5} />
      </EffectComposer>
    );
  }

  if (tier === 'standard') {
    return (
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.9} intensity={1.2} />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
      </EffectComposer>
    );
  }

  // Cinematic
  return (
    <EffectComposer disableNormalPass>
      <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.9} intensity={1.5} />
      <DepthOfField focusDistance={0.01} focalLength={0.02} bokehScale={2} />
      <ChromaticAberration offset={new Vector2(0.0005, 0.0005)} />
      <Vignette eskil={false} offset={0.1} darkness={0.8} />
      <FilmGrain premultiply blendFunction={BlendFunction.ADD} />
    </EffectComposer>
  );
}
