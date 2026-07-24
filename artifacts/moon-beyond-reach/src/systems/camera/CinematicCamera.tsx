import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTimelineStore } from '../../stores/timelineStore';
import { lerp } from '../../utils/math';

const MOON_DISTANCE_FLOOR = 45;

export function CinematicCamera() {
  const { camera, gl } = useThree();
  const currentAct = useTimelineStore((s) => s.currentAct);

  const targetPos = useRef(new THREE.Vector3(0, 0, 50));
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));

  // Reusable vector — avoids allocating a new Vector3 every frame
  const lerpTarget = useRef(new THREE.Vector3());

  // Interaction state
  const isDragging = useRef(false);
  const dragOrigin = useRef({ x: 0, y: 0 });
  const orbitOffsets = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      dragOrigin.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragOrigin.current.x;
      const dy = e.clientY - dragOrigin.current.y;
      const speed = 0.002;
      orbitOffsets.current.x = Math.max(-0.5, Math.min(0.5, orbitOffsets.current.x - dx * speed));
      orbitOffsets.current.y = Math.max(-0.25, Math.min(0.25, orbitOffsets.current.y - dy * speed));
      dragOrigin.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDragging.current = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [gl]);

  useEffect(() => {
    switch (currentAct) {
      case 'threshold': targetPos.current.set(0, -5, 60);                        break;
      case 'overture':  targetPos.current.set(0, 0, 55);                         break;
      case 'moon':      targetPos.current.set(0, 0, MOON_DISTANCE_FLOOR);        break;
      case 'water':     targetPos.current.set(0, -5, MOON_DISTANCE_FLOOR + 5);   break;
      case 'grove':     targetPos.current.set(0, -8, MOON_DISTANCE_FLOOR + 10);  break;
      case 'galaxy':    targetPos.current.set(10, 5, 40);                         break;
      case 'dawn':      targetPos.current.set(0, 0, MOON_DISTANCE_FLOOR);        break;
    }
  }, [currentAct]);

  useFrame((state) => {
    const breathingY = Math.sin(state.clock.elapsedTime * 0.4) * 0.03;
    const breathingZ = Math.cos(state.clock.elapsedTime * 0.3) * 0.03;

    const radius = targetPos.current.z;
    const az = orbitOffsets.current.x;
    const el = orbitOffsets.current.y;

    if (!isDragging.current) {
      orbitOffsets.current.x = lerp(orbitOffsets.current.x, 0, 0.02);
      orbitOffsets.current.y = lerp(orbitOffsets.current.y, 0, 0.02);
    }

    const cx = targetPos.current.x + Math.sin(az) * radius;
    const cy = targetPos.current.y + Math.sin(el) * radius + breathingY;
    const cz = Math.cos(az) * Math.cos(el) * radius + breathingZ;

    const distToOrigin = Math.sqrt(cx * cx + cy * cy + cz * cz);
    // Guard against degenerate case (distToOrigin == 0)
    if (distToOrigin < 0.001) return;
    const scale = Math.max(distToOrigin, MOON_DISTANCE_FLOOR) / distToOrigin;

    lerpTarget.current.set(cx * scale, cy * scale, cz * scale);
    camera.position.lerp(lerpTarget.current, 0.05);
    camera.lookAt(lookTarget.current);
  });

  return null;
}
