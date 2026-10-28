"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { ROOM, RIGHT_X } from "@/lib/room";

// ============================================
// SECTION 2: LIGHTING SETTINGS (look)
// Reflections and screen effects.
// ============================================
const LOOK = {
  /** Ambient occlusion: darkens corners and where objects meet surfaces. */
  ao: { radius: 0.45, intensity: 2.2, falloff: 0.6 },
  /** Only things brighter than this glow (lamp bulbs, LED strips, screens). */
  bloom: { threshold: 0.85, intensity: 0.55, smoothing: 0.3 },
  vignette: { offset: 0.35, darkness: 0.4 },
};

/**
 * Reflections. Instead of downloading an HDR image, a tiny environment is
 * built from glowing panels placed where the room's real light sources are,
 * so glossy surfaces (floor, desk, plastic) reflect the right things.
 */
export function RoomReflections() {
  return (
    <Environment resolution={128} frames={1} background={false}>
      {/* Warm cove strips overhead */}
      <Lightformer form="rect" color="#ffb36b" intensity={2.2} position={[0, ROOM.height, -1.5]} rotation-x={Math.PI / 2} scale={[4, 0.2, 1]} />
      <Lightformer form="rect" color="#ffb36b" intensity={2.2} position={[0, ROOM.height, 1.4]} rotation-x={Math.PI / 2} scale={[4, 0.2, 1]} />
      {/* Cool window */}
      <Lightformer form="rect" color="#7f9ee8" intensity={1.4} position={[0.55, 1.35, ROOM.backZ]} scale={[1.9, 1.9, 1]} />
      {/* Desk lamp and monitor */}
      <Lightformer form="circle" color="#ffcf9e" intensity={3} position={[RIGHT_X - 0.3, 1.2, -1.05]} scale={0.25} />
      <Lightformer form="rect" color="#ff8a4f" intensity={1.2} position={[RIGHT_X - 0.25, 1.05, -0.45]} rotation-y={-Math.PI / 2} scale={[0.64, 0.36, 1]} />
    </Environment>
  );
}

/** Screen-space effects. Desktop / high quality only: they cost GPU time. */
export function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <N8AO
        aoRadius={LOOK.ao.radius}
        intensity={LOOK.ao.intensity}
        distanceFalloff={LOOK.ao.falloff}
        quality="medium"
        halfRes
      />
      <Bloom
        mipmapBlur
        luminanceThreshold={LOOK.bloom.threshold}
        luminanceSmoothing={LOOK.bloom.smoothing}
        intensity={LOOK.bloom.intensity}
      />
      <Vignette offset={LOOK.vignette.offset} darkness={LOOK.vignette.darkness} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
