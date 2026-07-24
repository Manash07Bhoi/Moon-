import { useTimelineStore } from '../stores/timelineStore';

export function ActIndicator() {
  const currentAct = useTimelineStore((s) => s.currentAct);
  
  // Maps act to roman numeral
  const map: Record<string, string> = {
    threshold: '0',
    overture: 'I',
    moon: 'II',
    water: 'III',
    grove: 'IV',
    galaxy: 'V',
    dawn: 'VI'
  };

  if (currentAct === 'threshold') return null;

  return (
    <div className="absolute top-6 right-6 z-40 pointer-events-none">
      <p className="font-mono text-[10px] tracking-widest text-[#DDD9E0] opacity-20">
        ACT {map[currentAct]}
      </p>
    </div>
  );
}
