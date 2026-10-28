import { create } from "zustand";
import type { Quality } from "@/lib/device";
import type { HotspotId } from "@/data/hotspots";

// Shared state between the HTML page and the 3D scene.

/**
 * Loading stages, in order. The loading screen turns these into a
 * percentage, so the number reflects what has actually loaded.
 */
export type LoadStage =
  | "html" // page hydrated
  | "checked" // WebGL support known
  | "module" // three.js bundle downloaded and mounted
  | "frame"; // first 3D frame drawn (or no WebGL: nothing to wait for)

/**
 * loading   → loading screen visible
 * intro     → loading screen fading, intro animation playing
 * done      → intro finished, page fully interactive
 */
export type IntroPhase = "loading" | "intro" | "done";

/**
 * hero     → normal page, room in the background
 * explore  → hero text hidden, visitor looks around the room
 * (a focused hotspot is tracked separately in `focus`)
 */
export type ViewMode = "hero" | "explore";

type SceneState = {
  quality: Quality;
  setQuality: (q: Quality) => void;

  stages: Record<LoadStage, boolean>;
  markStage: (s: LoadStage) => void;

  /** 0–1 share of 3D assets (models, textures) loaded. Set from inside the canvas. */
  assets: number;
  setAssets: (v: number) => void;

  phase: IntroPhase;
  setPhase: (p: IntroPhase) => void;
  /** performance.now() when the intro began. Intro animations measure time from here. */
  introStart: number | null;

  /** True when the 3D scene is not shown (no WebGL). */
  noWebGL: boolean;
  setNoWebGL: (v: boolean) => void;

  mode: ViewMode;
  setMode: (m: ViewMode) => void;

  /** The hotspot whose panel is open, or null. */
  focus: HotspotId | null;
  setFocus: (f: HotspotId | null) => void;

  /** Index into ANGLES (src/lib/room.ts) for explore mode. */
  angle: number;
  setAngle: (i: number) => void;

  /** The hotspot under the cursor, or null. */
  hovered: HotspotId | null;
  setHovered: (h: HotspotId | null) => void;

  /** True once the Projects section covers the room (the 3D scene can pause). */
  pastHero: boolean;
  setPastHero: (v: boolean) => void;
};

export const useSceneStore = create<SceneState>((set) => ({
  quality: "high",
  setQuality: (quality) => set({ quality }),

  stages: { html: false, checked: false, module: false, frame: false },
  markStage: (s) =>
    set((state) => (state.stages[s] ? state : { stages: { ...state.stages, [s]: true } })),

  assets: 0,
  setAssets: (assets) => set({ assets }),

  phase: "loading",
  setPhase: (phase) =>
    set((state) => ({
      phase,
      introStart:
        phase === "intro" && state.introStart === null ? performance.now() : state.introStart,
    })),
  introStart: null,

  noWebGL: false,
  setNoWebGL: (noWebGL) => set({ noWebGL }),

  mode: "hero",
  setMode: (mode) => set(mode === "hero" ? { mode, focus: null, angle: 0 } : { mode }),

  focus: null,
  // Focusing a hotspot always puts the page in explore mode.
  setFocus: (focus) => set(focus ? { focus, mode: "explore", hovered: null } : { focus }),

  angle: 0,
  setAngle: (angle) => set({ angle }),

  hovered: null,
  setHovered: (hovered) => set({ hovered }),

  pastHero: false,
  setPastHero: (pastHero) => set({ pastHero }),
}));
