import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';
import { useTimelineStore } from '../../stores/timelineStore';

export function Fog() {
  const currentAct = useTimelineStore((s) => s.currentAct);
  
  // Target fog density based on act
  let targetDensity = 0.02; // default
  let targetColor = '#05060A';
  
  switch (currentAct) {
    case 'threshold':
      targetDensity = 0.1;
      targetColor = '#05060A';
      break;
    case 'overture':
      targetDensity = 0.02;
      targetColor = '#10172B';
      break;
    case 'moon':
      targetDensity = 0.015;
      targetColor = '#10172B';
      break;
    case 'water':
      targetDensity = 0.03;
      targetColor = '#8E7FCB'; // yearning tint
      break;
    case 'grove':
      targetDensity = 0.04;
      targetColor = '#10172B';
      break;
    case 'galaxy':
      targetDensity = 0.005; // clear
      targetColor = '#05060A';
      break;
    case 'dawn':
      targetDensity = 0.01;
      targetColor = '#DCB273'; // ember tint
      break;
  }
  
  useFrame(({ scene }) => {
    if (!scene.fog) {
      scene.fog = new THREE.FogExp2('#05060A', 0.02);
    }
    
    const fog = scene.fog as THREE.FogExp2;
    fog.density += (targetDensity - fog.density) * 0.01;
    
    const targetC = new THREE.Color(targetColor);
    fog.color.lerp(targetC, 0.01);
  });

  return null;
}
