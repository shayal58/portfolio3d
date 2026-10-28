"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { CameraController, CAMERA_FOV } from "./CameraController";
import { LightDriver, Lighting } from "./Lighting";
import { Environment } from "./Environment";
import { IntroBurst } from "./IntroBurst";
import { LoadTracker, SceneReady } from "./LoadTracker";
import { RoomShell } from "./room/RoomShell";
import { Furniture } from "./room/Furniture";
import { Effects, RoomReflections } from "./Effects";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSceneStore } from "@/stores/useSceneStore";
import { QUALITY_SETTINGS, detectQuality } from "@/lib/device";
import { VIEWS } from "@/lib/room";

/**
 * The single WebGL canvas for the whole site: Shayal's room.
 * Later phases add scenes as children here instead of more canvases.
 */
export default function Experience() {
  const reducedMotion = useReducedMotion();
  const quality = useSceneStore((s) => s.quality);
  const setQuality = useSceneStore((s) => s.setQuality);
  // Nothing of the room is visible behind the Projects section, so stop
  // drawing it there: saves battery and keeps scrolling smooth.
  // Only after the intro: the loading screen waits for the first frame.
  const paused = useSceneStore((s) => s.phase === "done" && s.pastHero && s.mode === "hero" && !s.focus);
  const [ready, setReady] = useState(false);

  // Initial quality guess from screen size / pointer type.
  useEffect(() => {
    setQuality(detectQuality());
    setReady(true);
  }, [setQuality]);

  if (!ready) return null;
  const settings = QUALITY_SETTINGS[quality];

  return (
    <Canvas
      // aria-hidden: the 3D room is a visual layer; all content is also in HTML.
      aria-hidden
      className="!fixed inset-0 z-0"
      dpr={settings.dpr}
      frameloop={paused ? "never" : "always"}
      shadows={settings.shadows ? "percentage" : false}
      gl={{ antialias: quality === "high", powerPreference: "high-performance" }}
      camera={{ fov: CAMERA_FOV, near: 0.05, far: 60, position: VIEWS.start.pos }}
    >
      {/* Drop to low quality if the frame rate stays poor. */}
      <PerformanceMonitor onDecline={() => setQuality("low")} />
      <AdaptiveDpr pixelated={false} />
      <LoadTracker />
      <LightDriver reducedMotion={reducedMotion} />

      <Suspense fallback={null}>
        <CameraController reducedMotion={reducedMotion} />
        <Lighting quality={quality} />
        <Environment particleCount={settings.particles} reducedMotion={reducedMotion} />
        <RoomShell reducedMotion={reducedMotion} />
        <Furniture />
        <RoomReflections />
        {!reducedMotion && <IntroBurst particleCount={settings.burst} />}
        <SceneReady />
      </Suspense>
      {quality === "high" && <Effects />}
    </Canvas>
  );
}
