import * as THREE from 'three';
import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ReactLenis } from 'lenis/react';
import { useExperienceStore } from './stores/experienceStore';
import { EntryGate } from './components/EntryGate';
import { LyricCueOverlay } from './components/LyricCueOverlay';
import { MuteControl } from './components/MuteControl';
import { ActIndicator } from './components/ActIndicator';
import { CanvasErrorBoundary } from './components/CanvasErrorBoundary';
import { WebGLFallback } from './components/WebGLFallback';
import { webGLTier } from './systems/webgl/WebGLProbe';

import { AudioEngine } from './systems/audio/AudioEngine';
import { LyricEngine } from './systems/timeline/LyricEngine';
import { CinematicCamera } from './systems/camera/CinematicCamera';

import { Moon } from './components/world/Moon';
import { StarField } from './components/world/StarField';
import { AuroraRibbon } from './components/world/AuroraRibbon';
import { Lake } from './components/world/Lake';
import { Forest } from './components/world/Forest';
import { Galaxy } from './components/world/Galaxy';
import { Rain } from './components/world/Rain';
import { Fog } from './components/world/Fog';
import { PostProcessing } from './components/PostProcessing';

/**
 * R3F `gl` factory — creates the WebGLRenderer ourselves so we can:
 *  1. Catch context-creation failures before THREE throws an uncaught error
 *  2. Set powerPreference:'default' to allow software (SwiftShader) fallback
 */
function makeRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer {
  // Try WebGL2, then WebGL1
  const contextTypes = ['webgl2', 'webgl', 'experimental-webgl'] as const;
  for (const type of contextTypes) {
    try {
      const ctx = canvas.getContext(type, {
        powerPreference: 'default',
        antialias: false,
        alpha: false,
        stencil: false,
        depth: true,
      });
      if (ctx) {
        const renderer = new THREE.WebGLRenderer({
          canvas,
          context: ctx as WebGLRenderingContext,
          antialias: false,
          alpha: false,
          stencil: false,
          depth: true,
          powerPreference: 'default',
        });
        renderer.setClearColor('#05060A', 1);
        return renderer;
      }
    } catch {
      // Try next context type
    }
  }
  // All attempts failed — throw a friendly error so the error boundary renders
  throw new Error('WebGL unavailable: all context types failed');
}

// Clamp DPR: software rendering struggles at high pixel ratios
const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5);

export default function App() {
  const hasEntered = useExperienceStore((s) => s.hasEntered);
  // webglFailed starts true when the probe already determined WebGL is absent.
  // It can also flip true at runtime if makeRenderer throws despite the probe,
  // in which case the window error handler below suppresses the dev overlay.
  const [webglFailed, setWebglFailed] = useState(!webGLTier.available);

  useEffect(() => {
    if (webglFailed) return; // already failed — no need to listen
    const handle = (event: ErrorEvent) => {
      const msg = event.error?.message ?? event.message ?? '';
      if (msg.includes('WebGL') || msg.includes('context')) {
        // Suppress the Vite dev overlay — CanvasErrorBoundary / WebGLFallback
        // already provides a graceful UI for this situation.
        event.preventDefault();
        event.stopImmediatePropagation();
        setWebglFailed(true);
      }
    };
    // Capture phase so we run before the Vite overlay plugin's listener
    window.addEventListener('error', handle, true);
    return () => window.removeEventListener('error', handle, true);
  }, [webglFailed]);

  return (
    <ReactLenis root>
      <div className="relative w-full h-[100dvh] bg-[#05060A] overflow-hidden text-[#DDD9E0] font-mono selection:bg-[#5FE0D8] selection:text-[#05060A]">

        {/* DOM UI Layer — always rendered above the canvas */}
        <EntryGate />
        {hasEntered && <LyricCueOverlay />}
        {hasEntered && <MuteControl />}
        {hasEntered && <ActIndicator />}

        {/* 3D World */}
        <div className="absolute inset-0 pointer-events-auto z-0">
          {!webglFailed ? (
            <CanvasErrorBoundary>
              <Canvas
                gl={makeRenderer as any}
                camera={{ position: [0, 0, 50], fov: 45 }}
                dpr={dpr}
                onCreated={({ gl }) => {
                  gl.setClearColor('#05060A', 1);
                }}
              >
                {hasEntered && (
                  <>
                    <AudioEngine />
                    <LyricEngine />
                    <CinematicCamera />

                    {/* World Elements */}
                    <Fog />
                    <StarField />
                    <AuroraRibbon />
                    <Moon />
                    <Lake />
                    <Forest />
                    <Galaxy />
                    <Rain />

                    {/* Lights */}
                    <ambientLight intensity={0.1} />
                    <directionalLight position={[0, 50, 50]} intensity={0.2} color="#8E7FCB" />
                    <pointLight position={[-20, 20, -20]} intensity={0.1} color="#5FE0D8" />

                    <PostProcessing />
                  </>
                )}
              </Canvas>
            </CanvasErrorBoundary>
          ) : (
            <WebGLFallback />
          )}
        </div>
      </div>
    </ReactLenis>
  );
}
