import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Howl, Howler } from 'howler';
import { useAudioStore } from '../../stores/audioStore';
import { useTimelineStore } from '../../stores/timelineStore';
import { useExperienceStore } from '../../stores/experienceStore';

export function AudioEngine() {
  const howlRef = useRef<Howl | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const setBands = useAudioStore((s) => s.setBands);
  const setPlaying = useAudioStore((s) => s.setPlaying);
  const volume = useAudioStore((s) => s.volume);
  const hasEntered = useExperienceStore((s) => s.hasEntered);
  const setElapsed = useTimelineStore((s) => s.setElapsed);

  // Smoothing state — kept as refs to avoid re-renders
  const prevBass = useRef(0);
  const prevMid = useRef(0);
  const prevTreble = useRef(0);

  const setupAnalyser = () => {
    const ctx = Howler.ctx;
    if (!ctx || analyserRef.current) return;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;

    // Branch the master gain into the analyser
    // Howler already connects masterGain → destination; branching adds analyser in parallel
    Howler.masterGain.connect(analyser);

    analyserRef.current = analyser;
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
  };

  useEffect(() => {
    if (!howlRef.current) {
      howlRef.current = new Howl({
        src: ['/audio/track.mp3'],
        html5: false, // required for Web Audio API analyser
        volume,
        onplay: () => {
          setPlaying(true);
          // Set up analyser the moment audio starts — ctx is guaranteed to exist here
          setupAnalyser();
        },
        onpause: () => setPlaying(false),
        onend: () => setPlaying(false),
        onseek: () => {
          const seek = howlRef.current?.seek() as number;
          if (typeof seek === 'number') setElapsed(seek);
        },
        onloaderror: (_id, err) => console.error('Audio load error:', err),
        onplayerror: (_id, err) => console.error('Audio play error:', err),
      });
    }

    return () => {
      howlRef.current?.unload();
      howlRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync volume changes
  useEffect(() => {
    howlRef.current?.volume(volume);
  }, [volume]);

  // Start playback on entry
  useEffect(() => {
    if (hasEntered && howlRef.current && !howlRef.current.playing()) {
      howlRef.current.play();
    }
  }, [hasEntered]);

  useFrame(() => {
    const howl = howlRef.current;
    if (!howl?.playing()) return;

    // Update elapsed time for the timeline
    const seek = howl.seek();
    if (typeof seek === 'number') setElapsed(seek);

    // Frequency analysis
    if (analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const data = dataArrayRef.current;

      // Bass: bins 0–5
      let bassSum = 0;
      for (let i = 0; i < 6; i++) bassSum += data[i];
      const rawBass = bassSum / (6 * 255);

      // Mid: bins 6–20
      let midSum = 0;
      for (let i = 6; i < 21; i++) midSum += data[i];
      const rawMid = midSum / (15 * 255);

      // Treble: bins 21–60
      let trebleSum = 0;
      for (let i = 21; i < 61; i++) trebleSum += data[i];
      const rawTreble = trebleSum / (40 * 255);

      // Smoothing — fast attack for bass, slow for treble
      const bassAlpha = rawBass > prevBass.current ? 0.3 : 0.05;
      const bass   = prevBass.current   + (rawBass   - prevBass.current)   * bassAlpha;
      const mid    = prevMid.current    + (rawMid    - prevMid.current)    * 0.15;
      const treble = prevTreble.current + (rawTreble - prevTreble.current) * 0.05;

      prevBass.current   = bass;
      prevMid.current    = mid;
      prevTreble.current = treble;

      setBands(bass, mid, treble);
    }
  });

  return null;
}
