import { create } from 'zustand';

interface ExperienceState {
  hasEntered: boolean;
  moonTapCount: number;
  constellationsFormed: number;
  setEntered: (val: boolean) => void;
  incrementMoonTap: () => void;
  incrementConstellation: () => void;
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  hasEntered: false,
  moonTapCount: 0,
  constellationsFormed: 0,
  setEntered: (val) => set({ hasEntered: val }),
  incrementMoonTap: () => set((state) => ({ moonTapCount: state.moonTapCount + 1 })),
  incrementConstellation: () => set((state) => ({ constellationsFormed: state.constellationsFormed + 1 })),
}));
