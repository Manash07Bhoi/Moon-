export function detectTier(): 'cinematic' | 'standard' | 'efficiency' {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return 'efficiency';
  const mem = (navigator as any).deviceMemory;
  if (mem && mem <= 2) return 'efficiency';
  if (mem && mem <= 4) return 'standard';
  return 'cinematic'; // default to cinematic
}
