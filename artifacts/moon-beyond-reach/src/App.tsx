import { Canvas } from '@react-three/fiber';
import { ReactLenis } from 'lenis/react';
import { useExperienceStore } from './stores/experienceStore';
import { EntryGate } from './components/EntryGate';
import { LyricCueOverlay } from './components/LyricCueOverlay';
import { MuteControl } from './components/MuteControl';
import { ActIndicator } from './components/ActIndicator';

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

export default function App() {
  const hasEntered = useExperienceStore((s) => s.hasEntered);

  return (
    <ReactLenis root>
      <div className="relative w-full h-[100dvh] bg-[#05060A] overflow-hidden text-[#DDD9E0] font-mono selection:bg-[#5FE0D8] selection:text-[#05060A]">
        
        {/* DOM UI Layer */}
        <EntryGate />
        {hasEntered && <LyricCueOverlay />}
        {hasEntered && <MuteControl />}
        {hasEntered && <ActIndicator />}

        {/* 3D World */}
        <div className="absolute inset-0 pointer-events-auto z-0">
          <Canvas
            gl={{ antialias: false, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 50], fov: 45 }}
            dpr={[1, 2]}
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
        </div>
      </div>
    </ReactLenis>
  );
}
