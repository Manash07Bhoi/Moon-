import { useEffect, useState } from 'react';
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
  const elapsed = useTimelineStore((s) => s.elapsed);
  const setTimelineState = useTimelineStore((s) => s.setTimelineState);
  const currentAct = useTimelineStore((s) => s.currentAct);
  
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}lyrics.json`)
      .then(res => res.json())
      .then(data => {
        if (data && data.entries) {
          setEntries(data.entries);
        }
      })
      .catch(err => console.error('Failed to load lyrics', err));
  }, []);

  useFrame(() => {
    if (entries.length === 0) return;
    
    // Find active entry
    const active = entries.find(e => elapsed >= e.start && elapsed < e.end);
    
    if (active) {
      if (active.type === 'line') {
        setTimelineState({
          activeCue: active.cue || null,
          activeLine: active.text || null,
          currentAct: (active.act as any) || currentAct
        });
      } else {
        setTimelineState({
          activeCue: null,
          activeLine: null,
        });
      }
    } else {
      setTimelineState({
        activeCue: null,
        activeLine: null,
      });
    }
    
    // Act progression fallback (if no line triggers act change)
    // Threshold (0-4), Overture (4-24), Moon (24-93), Water (93-120), Grove (120-180), Galaxy (180-218), Dawn (218-300)
    let act = currentAct;
    if (elapsed >= 0 && elapsed < 4) act = 'threshold';
    else if (elapsed >= 4 && elapsed < 24) act = 'overture';
    else if (elapsed >= 24 && elapsed < 93) act = 'moon';
    else if (elapsed >= 93 && elapsed < 120) act = 'water';
    else if (elapsed >= 120 && elapsed < 180) act = 'grove';
    else if (elapsed >= 180 && elapsed < 218) act = 'galaxy';
    else if (elapsed >= 218) act = 'dawn';
    
    if (act !== currentAct) {
      setTimelineState({ currentAct: act });
    }
  });

  return null;
}
