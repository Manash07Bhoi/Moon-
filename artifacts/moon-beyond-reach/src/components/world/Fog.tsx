import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTimelineStore } from '../../stores/timelineStore';

type ActColors = { density: number; color: string };

const ACT_FOG: Record<string, ActColors> = {
  threshold: { density: 0.1,   color: '#05060A' },
  overture:  { density: 0.02,  color: '#10172B' },
  moon:      { density: 0.015, color: '#10172B' },
  water:     { density: 0.03,  color: '#8E7FCB' },
  grove:     { density: 0.04,  color: '#10172B' },
  galaxy:    { density: 0.005, color: '#05060A' },
  dawn:      { density: 0.01,  color: '#DCB273' },
};

export function Fog() {
  const currentAct = useTimelineStore((s) => s.currentAct);

  // Refs for lerp targets — avoids creating new THREE.Color every frame
  const fogRef = useRef<THREE.FogExp2 | null>(null);
  const targetDensity = useRef(0.02);
  const targetColor = useRef(new THREE.Color('#05060A'));

  // Update targets reactively when the act changes
  useEffect(() => {
    const cfg = ACT_FOG[currentAct] ?? { density: 0.02, color: '#05060A' };
    targetDensity.current = cfg.density;
    targetColor.current.set(cfg.color);
  }, [currentAct]);

  useFrame(({ scene }) => {
    // Create fog once and keep the reference
    if (!fogRef.current) {
      fogRef.current = new THREE.FogExp2('#05060A', 0.02);
      scene.fog = fogRef.current;
    }

    const fog = fogRef.current;
    fog.density += (targetDensity.current - fog.density) * 0.01;
    fog.color.lerp(targetColor.current, 0.01);
  });

  return null;
}
