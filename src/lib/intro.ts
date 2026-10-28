// ============================================
// SECTION 4: ANIMATION CONFIGURATION
// The intro timeline, in seconds after the loading
// screen starts fading. Every intro animation (3D and
// HTML) reads from here, so they stay in sync.
// ============================================
export const INTRO = {
  glow: { start: 0.0, end: 0.7 }, // intro object brightens
  burst: { start: 0.55, end: 2.1 }, // particles fly out of its surface
  dissolve: { start: 0.65, end: 1.1 }, // intro object shrinks away
  camera: { start: 0.3, duration: 2.4 }, // dolly from far to resting position
  roomLights: { start: 0.9, end: 2.3 }, // room lights fade up, revealing the workspace
  heroText: { start: 1.2 }, // HTML headline begins revealing
  /** When the intro counts as finished. */
  total: 2.8,
};

/** 0→1 progress of `t` through the window [start, end], clamped. */
export function windowProgress(t: number, start: number, end: number): number {
  if (t <= start) return 0;
  if (t >= end) return 1;
  return (t - start) / (end - start);
}

export const ease = {
  outCubic: (x: number) => 1 - Math.pow(1 - x, 3),
  inCubic: (x: number) => x * x * x,
  outBack: (x: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  },
};
