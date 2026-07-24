import { create } from 'zustand';

interface AudioState {
  bass: number;
  mid: number;
  treble: number;
  isPlaying: boolean;
  volume: number;
  setBands: (bass: number, mid: number, treble: number) => void;
  setPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  bass: 0,
  mid: 0,
  treble: 0,
  isPlaying: false,
  volume: 1,
  setBands: (bass, mid, treble) => set({ bass, mid, treble }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume }),
}));
