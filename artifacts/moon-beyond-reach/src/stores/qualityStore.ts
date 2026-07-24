import { create } from 'zustand';
import { detectTier } from '../utils/quality';

interface QualityState {
  tier: 'cinematic' | 'standard' | 'efficiency';
  setTier: (tier: 'cinematic' | 'standard' | 'efficiency') => void;
}

export const useQualityStore = create<QualityState>((set) => ({
  tier: detectTier(),
  setTier: (tier) => set({ tier }),
}));
