"use client";

import { useSceneStore } from "@/stores/useSceneStore";
import type { HotspotId } from "@/data/hotspots";

// Opening explore mode or a panel adds a browser history entry, so the
// Back button closes it again, and Forward reopens it. All UI goes through
// these helpers rather than calling the store directly.

type NavState = { view: "explore" } | { view: "panel"; panel: HotspotId };

// Next.js also keeps its own data in history.state, so entries are never
// simply null: always check the `view` field.
type MaybeNav = Partial<{ view: string; panel: HotspotId }> | null;
const current = (): MaybeNav => (typeof history !== "undefined" ? (history.state as MaybeNav) : null);

export function openExplore() {
  const { mode, setMode } = useSceneStore.getState();
  if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: "auto" });
  if (mode === "hero") history.pushState({ view: "explore" } satisfies NavState, "");
  setMode("explore");
}

export function openPanel(id: HotspotId) {
  const { focus, setFocus } = useSceneStore.getState();
  const state: NavState = { view: "panel", panel: id };
  if (focus) {
    history.replaceState(state, ""); // switching panels: no extra entry
  } else {
    // Closing the panel goes back to wherever the visitor was: the page
    // (opened from the top bar or a hero button) or the room (explore mode).
    history.pushState(state, "");
  }
  setFocus(id);
}

export function closePanel() {
  if (current()?.view === "panel") history.back();
  else useSceneStore.getState().setFocus(null);
}

export function exitExplore() {
  const { setMode } = useSceneStore.getState();
  if (current()?.view === "explore") history.back();
  else setMode("hero");
}

/** Apply a history entry to the scene. Call from a popstate listener. */
export function applyHistoryState(state: MaybeNav) {
  const { setMode, setFocus } = useSceneStore.getState();
  if (state?.view === "panel" && state.panel) {
    setFocus(state.panel);
  } else if (state?.view === "explore") {
    setFocus(null);
    setMode("explore");
  } else {
    setMode("hero");
  }
}
