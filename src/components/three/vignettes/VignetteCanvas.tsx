"use client";

import { Canvas } from "@react-three/fiber";
import { SCENES, VignetteLights } from "./scenes";

type Props = { slug: keyof typeof SCENES; still: boolean };

/** The WebGL part of a project vignette. Loaded only when the card is on screen. */
export default function VignetteCanvas({ slug, still }: Props) {
  const Scene = SCENES[slug];
  return (
    <Canvas
      aria-hidden
      dpr={[1, 1.75]}
      frameloop={still ? "demand" : "always"}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      camera={{ fov: 35, position: [0, 0.15, 5.2] }}
    >
      <VignetteLights />
      <Scene still={still} />
    </Canvas>
  );
}
