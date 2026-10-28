"use client";

import { useEffect } from "react";
import { useSceneStore } from "@/stores/useSceneStore";

/**
 * How far the visitor has scrolled from the hero to the Projects section:
 * 0 at the top of the page, 1 once the section's top reaches the top of
 * the screen. A plain mutable value read inside useFrame, so scrolling
 * never re-renders React.
 */
export const scrollState = { progress: 0 };

/** Above this, the Projects section covers the room and the 3D scene can pause. */
const COVERED = 0.98;

/** Keeps scrollState up to date. Mount once on the home page. */
export function useScrollProgress() {
  useEffect(() => {
    const section = document.getElementById("projects");
    if (!section) return;
    const root = document.documentElement;
    let raf = 0;

    const update = () => {
      raf = 0;
      const start = section.offsetTop;
      const p = start > 0 ? Math.min(1, Math.max(0, window.scrollY / start)) : 0;
      scrollState.progress = p;
      // Hero text fades out over the first half of the scroll.
      root.style.setProperty("--hero-fade", String(Math.max(0, 1 - p * 2)));
      const covered = p > COVERED;
      if (useSceneStore.getState().pastHero !== covered) useSceneStore.getState().setPastHero(covered);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
}

/** Smooth-scroll to a section, or jump there for reduced-motion visitors. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}
