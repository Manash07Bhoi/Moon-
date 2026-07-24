import { create } from 'zustand';

export type Act = 'threshold' | 'overture' | 'moon' | 'water' | 'grove' | 'galaxy' | 'dawn';

interface TimelineState {
  currentAct: Act;
  elapsed: number;
  activeCue: string | null;
  activeLine: string | null;
  setElapsed: (elapsed: number) => void;
  setTimelineState: (state: Partial<Omit<TimelineState, 'setElapsed' | 'setTimelineState'>>) => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  currentAct: 'threshold',
  elapsed: 0,
  activeCue: null,
  activeLine: null,
  setElapsed: (elapsed) => set({ elapsed }),
  setTimelineState: (state) => set((prev) => ({ ...prev, ...state })),
}));
