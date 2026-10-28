"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ROOM } from "@/lib/room";
import { sceneLight } from "./room/sceneLight";

type Props = { particleCount: number; reducedMotion: boolean };

/** Background colour, a little depth fog, and dust drifting in the room's light. */
export function Environment({ particleCount, reducedMotion }: Props) {
  const points = useRef<THREE.Points>(null);
  const mat = useRef<THREE.PointsMaterial>(null);

  // Dust positions inside the room, generated once per count.
  const positions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * (ROOM.width - 0.6);
      arr[i * 3 + 1] = 0.2 + Math.random() * (ROOM.height - 0.4);
      arr[i * 3 + 2] = ROOM.backZ + 0.3 + Math.random() * (ROOM.frontZ - ROOM.backZ - 0.6);
    }
    return arr;
  }, [particleCount]);

  useFrame((_, delta) => {
    if (mat.current) mat.current.opacity = 0.45 * sceneLight.level;
    if (!points.current || reducedMotion) return;
    points.current.rotation.y += delta * 0.01;
    points.current.position.y = Math.sin(performance.now() * 0.0002) * 0.06;
  });

  return (
    <>
      <color attach="background" args={["#080808"]} />
      <fog attach="fog" args={["#080808", 9, 20]} />
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={mat}
          size={0.012}
          color="#ffd2b0"
          transparent
          opacity={0}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </>
  );
}
