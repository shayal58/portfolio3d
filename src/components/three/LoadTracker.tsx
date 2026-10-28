"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { useSceneStore } from "@/stores/useSceneStore";

/**
 * Place OUTSIDE <Suspense>. Reports to the HTML loading screen that the
 * three.js module is mounted and how many 3D assets have loaded.
 */
export function LoadTracker() {
  const markStage = useSceneStore((s) => s.markStage);
  const setAssets = useSceneStore((s) => s.setAssets);
  const { progress, total, active } = useProgress();

  useEffect(() => {
    markStage("module");
  }, [markStage]);

  useEffect(() => {
    // No assets queued means nothing to wait for.
    setAssets(total === 0 || (!active && progress >= 100) ? 1 : progress / 100);
  }, [progress, total, active, setAssets]);

  return null;
}

/**
 * Place INSIDE <Suspense>, after the scene content. Its first frame only
 * runs once everything suspended above it has loaded.
 */
export function SceneReady() {
  const markStage = useSceneStore((s) => s.markStage);
  const done = useRef(false);

  useFrame(() => {
    if (done.current) return;
    done.current = true;
    markStage("frame");
  });

  return null;
}
