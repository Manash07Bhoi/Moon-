export const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
export const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;
export const mapRange = (val: number, in_min: number, in_max: number, out_min: number, out_max: number) =>
  ((val - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
