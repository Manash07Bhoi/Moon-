import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTimelineStore } from '../../stores/timelineStore';

interface LyricEntry {
  type: 'silence' | 'line';
  id?: string;
  start: number;
  end: number;
  text?: string;
  cue?: string;
  act?: string;
}

export function LyricEngine() {
  const [entries, setEntries] = useState<LyricEntry[]>([]);
  const setTimelineState = useTimelineStore((s) => s.setTimelineState);

  // Refs tracking last values sent to store — prevents spurious setTimelineState calls every frame
  const prevCue = useRef<string | null>(null);
  const prevLine = useRef<string | null>(null);
  const prevAct = useRef<string>(useTimelineStore.getState().currentAct);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}lyrics.json`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.entries) setEntries(data.entries);
      })
      .catch((err) => console.error('Failed to load lyrics', err));
  }, []);

  useFrame(() => {
    // Always read fresh elapsed from store — avoids stale closure
    const elapsed = useTimelineStore.getState().elapsed;
    const currentAct = useTimelineStore.getState().currentAct;

    // Act progression by time
    let nextAct = currentAct;
    if (elapsed >= 0 && elapsed < 4) nextAct = 'threshold';
    else if (elapsed >= 4 && elapsed < 24) nextAct = 'overture';
    else if (elapsed >= 24 && elapsed < 93) nextAct = 'moon';
    else if (elapsed >= 93 && elapsed < 120) nextAct = 'water';
    else if (elapsed >= 120 && elapsed < 180) nextAct = 'grove';
    else if (elapsed >= 180 && elapsed < 218) nextAct = 'galaxy';
    else if (elapsed >= 218) nextAct = 'dawn';

    if (nextAct !== prevAct.current) {
      prevAct.current = nextAct;
      setTimelineState({ currentAct: nextAct as any });
    }

    // Lyric cue resolution
    if (entries.length === 0) return;

    const active = entries.find((e) => elapsed >= e.start && elapsed < e.end);

    let newCue: string | null = null;
    let newLine: string | null = null;

    if (active && active.type === 'line') {
      newCue = active.cue ?? null;
      newLine = active.text ?? null;
    }

    // Only write to store when something changed
    if (newCue !== prevCue.current || newLine !== prevLine.current) {
      prevCue.current = newCue;
      prevLine.current = newLine;
      setTimelineState({ activeCue: newCue, activeLine: newLine });
    }
  });

  return null;
}
