"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "@/stores/useSceneStore";
import { INTRO, ease, windowProgress } from "@/lib/intro";
import { BURST_POS } from "@/lib/room";

// ============================================
// SECTION 4: ANIMATION CONFIGURATION
// The intro object: glows, bursts into
// particles, and dissolves. Timing is in
// src/lib/intro.ts.
// ============================================
const CORE_RADIUS = 0.55;
const BURST = { minSpeed: 1.2, maxSpeed: 3.8, size: 0.045 };

type Props = { particleCount: number };

export function IntroBurst({ particleCount }: Props) {
  const core = useRef<THREE.Mesh>(null);
  const coreMat = useRef<THREE.MeshStandardMaterial>(null);
  const points = useRef<THREE.Points>(null);
  const pointsMat = useRef<THREE.PointsMaterial>(null);
  const [finished, setFinished] = useState(false);

  // Random outward direction and speed per particle, made once.
  const { dirs, speeds, positions } = useMemo(() => {
    const dirs = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    const v = new THREE.Vector3();
    for (let i = 0; i < particleCount; i++) {
      v.randomDirection();
      dirs.set([v.x, v.y, v.z], i * 3);
      speeds[i] = BURST.minSpeed + Math.random() * (BURST.maxSpeed - BURST.minSpeed);
    }
    // Start every particle on the core's surface.
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < positions.length; i++) positions[i] = dirs[i] * CORE_RADIUS;
    return { dirs, speeds, positions };
  }, [particleCount]);

  useFrame((state, delta) => {
    if (finished || !core.current || !coreMat.current || !points.current || !pointsMat.current)
      return;

    const { introStart } = useSceneStore.getState();
    const t = introStart === null ? -1 : (performance.now() - introStart) / 1000;

    // While loading: idle spin, dim glow.
    core.current.rotation.x += delta * 0.4;
    core.current.rotation.y += delta * 0.6;
    if (t < 0) return;

    // 1. Glow up.
    const glow = ease.outCubic(windowProgress(t, INTRO.glow.start, INTRO.glow.end));
    coreMat.current.emissiveIntensity = 0.6 + glow * 5;

    // 2. Dissolve: shrink to nothing.
    const dissolve = ease.inCubic(windowProgress(t, INTRO.dissolve.start, INTRO.dissolve.end));
    core.current.scale.setScalar(1 + glow * 0.15 - dissolve * 1.15);
    core.current.visible = dissolve < 1;

    // 3. Burst: particles fly outward and fade.
    const b = windowProgress(t, INTRO.burst.start, INTRO.burst.end);
    points.current.visible = b > 0 && b < 1;
    if (b > 0) {
      const travel = ease.outCubic(b);
      const attr = points.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const r = CORE_RADIUS + speeds[i] * travel;
        arr[i * 3] = dirs[i * 3] * r;
        arr[i * 3 + 1] = dirs[i * 3 + 1] * r;
        arr[i * 3 + 2] = dirs[i * 3 + 2] * r;
      }
      attr.needsUpdate = true;
      pointsMat.current.opacity = 1 - ease.inCubic(b);
    }

    if (t > INTRO.burst.end) setFinished(true);
  });

  // Unmount once the burst is over; nothing left to draw.
  if (finished) return null;

  return (
    <group position={BURST_POS} scale={0.7}>
      <mesh ref={core}>
        <octahedronGeometry args={[CORE_RADIUS, 0]} />
        <meshStandardMaterial
          ref={coreMat}
          color="#2a1208"
          emissive="#ff642e"
          emissiveIntensity={0.6}
          flatShading
          toneMapped={false}
        />
      </mesh>
      <points ref={points} visible={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={pointsMat}
          size={BURST.size}
          color="#ffb08f"
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}
