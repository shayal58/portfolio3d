"use client";

import { useEffect } from "react";
import { useScrollProgress } from "@/lib/scroll";
import { useSceneStore } from "@/stores/useSceneStore";

/** Tracks scroll between the hero and Projects (see src/lib/scroll.ts). Renders nothing. */
export function ScrollDriver() {
  useScrollProgress();

  // The loading screen locks scrolling, so a link to /#projects can't land
  // until it lifts. Jump to the section then.
  const loading = useSceneStore((s) => s.phase === "loading");
  useEffect(() => {
    if (loading || window.location.hash !== "#projects") return;
    const raf = requestAnimationFrame(() =>
      document.getElementById("projects")?.scrollIntoView({ behavior: "auto", block: "start" }),
    );
    return () => cancelAnimationFrame(raf);
  }, [loading]);

  return null;
}
