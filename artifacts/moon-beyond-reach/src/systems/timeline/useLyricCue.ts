import { useTimelineStore } from '../../stores/timelineStore';

export function useLyricCue() {
  const activeCue = useTimelineStore((s) => s.activeCue);
  const activeLine = useTimelineStore((s) => s.activeLine);
  return { activeCue, activeLine };
}
