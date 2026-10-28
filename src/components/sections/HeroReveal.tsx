"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useSceneStore } from "@/stores/useSceneStore";
import { INTRO } from "@/lib/intro";

// useLayoutEffect warns during server rendering; this is the usual workaround.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Show the text anyway if the intro never starts (e.g. something failed). */
const SAFETY_MS = 15000;

/**
 * Wraps the hero and plays its text reveal in step with the 3D intro.
 *
 * Elements marked
 *   data-reveal       fade and rise
 *   data-reveal-mask  slide up from behind a mask
 * reveal in document order. The motion itself is CSS (see SECTION 4 in
 * globals.css), so it runs on real time even if the 3D scene is making
 * the page stutter. Text is never left hidden waiting on a slow frame.
 */
export function HeroReveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const introStart = useSceneStore((s) => s.introStart);

  // Before first paint: number the items and hide them.
  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = el.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-mask] > *");
    items.forEach((item, i) => item.style.setProperty("--reveal-i", String(i)));
    el.classList.add("reveal-ready");
    const safety = setTimeout(() => el.classList.add("revealed"), SAFETY_MS);
    return () => clearTimeout(safety);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (introStart === null || !el) return;
    // Wait measured from the shared intro start, so the text lines up with
    // the 3D animation even if this effect runs a little late.
    const elapsedMs = performance.now() - introStart;
    const wait = Math.max(0, INTRO.heroText.start * 1000 - elapsedMs);
    const t = setTimeout(() => el.classList.add("revealed"), wait);
    return () => clearTimeout(t);
  }, [introStart]);

  return <div ref={root}>{children}</div>;
}
