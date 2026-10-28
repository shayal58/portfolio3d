"use client";

import { useEffect, useRef, useState } from "react";
import { useSceneStore } from "@/stores/useSceneStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { INTRO } from "@/lib/intro";

// ============================================
// SECTION 4: ANIMATION CONFIGURATION
// Loading screen timing.
// ============================================
const LOADER = {
  /** Shortest time the screen stays up, so it never just flashes. */
  minVisibleMs: 1200,
  /** Give up waiting and show the page anyway (e.g. a GPU that hangs). */
  maxWaitMs: 12000,
  /** Fade-out length. Keep in sync with the duration-700 class below. */
  fadeMs: 700,
};

// How much each real loading stage contributes to the percentage.
// Assets (3D models, textures) are tracked inside the canvas.
const WEIGHTS = { html: 15, checked: 10, module: 45, assets: 20, frame: 10 };

export function LoadingScreen() {
  const stages = useSceneStore((s) => s.stages);
  const phase = useSceneStore((s) => s.phase);
  const setPhase = useSceneStore((s) => s.setPhase);
  const markStage = useSceneStore((s) => s.markStage);
  const reducedMotion = useReducedMotion();

  // Share of 3D assets loaded, reported by <LoadTracker> inside the canvas.
  const assetsDone = useSceneStore((s) => s.assets);

  const [shown, setShown] = useState(0); // the number on screen, eased
  const [gone, setGone] = useState(false);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    startedAt.current = performance.now();
    markStage("html");
  }, [markStage]);

  // Real progress target, 0–100.
  const target =
    (stages.html ? WEIGHTS.html : 0) +
    (stages.checked ? WEIGHTS.checked : 0) +
    (stages.module ? WEIGHTS.module : 0) +
    (stages.module ? WEIGHTS.assets * assetsDone : 0) +
    (stages.frame ? WEIGHTS.frame : 0);

  // Ease the displayed number toward the real target. It never runs ahead.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setShown((prev) => {
        const next = prev + (target - prev) * 0.12;
        return Math.abs(target - next) < 0.5 ? target : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  // Finish when everything has loaded and the minimum time has passed.
  useEffect(() => {
    if (phase !== "loading") return;
    const elapsed = performance.now() - (startedAt.current ?? performance.now());
    const allDone = Math.round(shown) >= 100;
    if (!allDone) return;
    const wait = Math.max(0, LOADER.minVisibleMs - elapsed);
    const t = setTimeout(() => setPhase("intro"), wait);
    return () => clearTimeout(t);
  }, [shown, phase, setPhase]);

  // Keep the safety timeout independent from percentage updates so progress
  // changes cannot keep postponing the fallback.
  useEffect(() => {
    if (phase !== "loading") return;
    const elapsed = performance.now() - (startedAt.current ?? performance.now());
    const fallback = setTimeout(
      () => setPhase("intro"),
      Math.max(0, LOADER.maxWaitMs - elapsed),
    );
    return () => clearTimeout(fallback);
  }, [phase, setPhase]);

  // Without WebGL there is no camera move to end the intro, so end it here.
  const noWebGL = useSceneStore((s) => s.noWebGL);
  useEffect(() => {
    if (phase !== "intro" || !noWebGL) return;
    const t = setTimeout(() => setPhase("done"), reducedMotion ? 0 : INTRO.total * 1000);
    return () => clearTimeout(t);
  }, [phase, noWebGL, reducedMotion, setPhase]);

  // Remove from the DOM once the fade finishes.
  useEffect(() => {
    if (phase === "loading") return;
    const t = setTimeout(() => setGone(true), reducedMotion ? 0 : LOADER.fadeMs);
    return () => clearTimeout(t);
  }, [phase, reducedMotion]);

  // Stop the page scrolling under the loader.
  useEffect(() => {
    document.documentElement.style.overflow = phase === "loading" ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [phase]);

  if (gone) return null;
  const pct = Math.min(100, Math.round(shown));

  return (
    <div
      id="loader"
      role="status"
      aria-live="polite"
      aria-label={`Loading, ${pct} percent`}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg transition-opacity duration-700 ${
        phase === "loading" ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <LoaderGlyph />
      <p className="mt-10 font-mono text-[11px] tracking-[0.35em] text-muted uppercase">
        Initializing Shayal&apos;s World
      </p>
      <p className="mt-3 font-display text-3xl font-medium tabular-nums">
        {String(pct).padStart(3, "0")}
        <span className="text-accent">%</span>
      </p>
      <div className="mt-4 h-px w-40 overflow-hidden bg-line">
        <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/**
 * A slowly rotating wireframe drawn in SVG + CSS. It is plain HTML so it
 * appears instantly, before the three.js bundle has downloaded.
 */
function LoaderGlyph() {
  return (
    <div className="loader-glyph relative size-28" aria-hidden>
      <svg viewBox="-50 -50 100 100" className="loader-spin absolute inset-0 size-full">
        <polygon
          points="0,-42 36,-21 36,21 0,42 -36,21 -36,-21"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.2"
        />
        <path
          d="M0,-42 L0,42 M36,-21 L-36,21 M36,21 L-36,-21 M0,-42 L36,21 L-36,21 Z"
          fill="none"
          stroke="var(--color-accent)"
          strokeOpacity="0.45"
          strokeWidth="0.8"
        />
      </svg>
      <div className="absolute inset-6 rounded-full bg-accent/25 blur-2xl" />
    </div>
  );
}
