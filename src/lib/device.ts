// ============================================
// SECTION 6: RESPONSIVE SETTINGS
// Adjust mobile and desktop rendering quality.
// "low" is used for small or touch screens.
// ============================================

export type Quality = "high" | "low";

export const QUALITY_SETTINGS = {
  high: { dpr: [1, 2] as [number, number], particles: 260, burst: 520, shadows: true },
  low: { dpr: [1, 1.25] as [number, number], particles: 90, burst: 220, shadows: false },
} as const;

/** Rough first guess at device capability. PerformanceMonitor refines it at runtime. */
export function detectQuality(): Quality {
  if (typeof window === "undefined") return "high";
  const smallScreen = window.matchMedia("(max-width: 768px)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  return smallScreen || coarsePointer ? "low" : "high";
}
