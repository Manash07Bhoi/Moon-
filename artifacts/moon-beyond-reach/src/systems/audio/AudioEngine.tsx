import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Howl, Howler } from 'howler';
import { useAudioStore } from '../../stores/audioStore';
import { useTimelineStore } from '../../stores/timelineStore';
import { useExperienceStore } from '../../stores/experienceStore';

export function AudioEngine() {
  const howlRef = useRef<Howl | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  
  const setBands = useAudioStore((s) => s.setBands);
  const setPlaying = useAudioStore((s) => s.setPlaying);
  const volume = useAudioStore((s) => s.volume);
  const hasEntered = useExperienceStore((s) => s.hasEntered);
  const setElapsed = useTimelineStore((s) => s.setElapsed);

  useEffect(() => {
    if (!howlRef.current) {
      howlRef.current = new Howl({
        src: ['/audio/track.mp3'],
        html5: false, // needed for Web Audio API context
        volume: volume,
        onplay: () => setPlaying(true),
        onpause: () => setPlaying(false),
        onend: () => setPlaying(false),
        onseek: () => {
          // ensure elapsed is updated if sought
          const seek = howlRef.current?.seek() as number;
          setElapsed(seek);
        }
      });
    }

    return () => {
      howlRef.current?.unload();
    };
  }, []);

  // Update volume if changed
  useEffect(() => {
    howlRef.current?.volume(volume);
  }, [volume]);

  // Handle entry play
  useEffect(() => {
    if (hasEntered && howlRef.current && !howlRef.current.playing()) {
      // Need AudioContext
      const ctx = Howler.ctx;
      if (ctx && !analyserRef.current) {
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        
        // Connect Howler master gain to analyser
        Howler.masterGain.connect(analyser);
        // And connect analyser to destination (so we hear it)
        // Wait, Howler masterGain is already connected to destination. 
        // We can just connect it to analyser, it will branch.
        
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      }
      
      howlRef.current.play();
    }
  }, [hasEntered]);

  // Smoothing states
  const prevBass = useRef(0);
  const prevMid = useRef(0);
  const prevTreble = useRef(0);

  useFrame(() => {
    if (howlRef.current && howlRef.current.playing()) {
      // Update elapsed time for Timeline
      const seek = howlRef.current.seek() as number;
      setElapsed(seek);
      
      // Audio analysis
      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const data = dataArrayRef.current;
        
        // Bass: bins 0-5
        let bassSum = 0;
        for (let i = 0; i < 6; i++) bassSum += data[i];
        let rawBass = bassSum / (6 * 255);
        
        // Mid: bins 6-20
        let midSum = 0;
        for (let i = 6; i < 21; i++) midSum += data[i];
        let rawMid = midSum / (15 * 255);
        
        // Treble: bins 21-60
        let trebleSum = 0;
        for (let i = 21; i < 61; i++) trebleSum += data[i];
        let rawTreble = trebleSum / (40 * 255);
        
        // Smoothing
        // Bass: fast attack (0.3), slow release (0.05)
        const bassAlpha = rawBass > prevBass.current ? 0.3 : 0.05;
        const bass = prevBass.current + (rawBass - prevBass.current) * bassAlpha;
        
        // Mid: medium (0.15)
        const mid = prevMid.current + (rawMid - prevMid.current) * 0.15;
        
        // Treble: heavy damping (0.05)
        const treble = prevTreble.current + (rawTreble - prevTreble.current) * 0.05;
        
        prevBass.current = bass;
        prevMid.current = mid;
        prevTreble.current = treble;
        
        setBands(bass, mid, treble);
      }
    }
  });

  return null;
}
