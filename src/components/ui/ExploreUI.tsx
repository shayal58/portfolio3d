"use client";

import { useEffect } from "react";
import { ArrowLeft, Video } from "lucide-react";
import { ANGLES } from "@/lib/room";
import { useSceneStore } from "@/stores/useSceneStore";
import { hotspots } from "@/data/hotspots";
import { applyHistoryState, closePanel, exitExplore, openPanel } from "@/lib/navigation";

/**
 * Controls shown while exploring the room:
 * - a "back to page" button,
 * - a list of the room's objects as real buttons. This is the keyboard,
 *   screen-reader and touch-friendly way in; clicking objects in 3D is a
 *   shortcut, never the only route.
 * Also wires up Esc and the browser Back/Forward buttons.
 */
export function ExploreUI() {
  const mode = useSceneStore((s) => s.mode);
  const focus = useSceneStore((s) => s.focus);
  const hovered = useSceneStore((s) => s.hovered);
  const angle = useSceneStore((s) => s.angle);
  const setAngle = useSceneStore((s) => s.setAngle);

  // Browser Back / Forward.
  useEffect(() => {
    const onPop = (e: PopStateEvent) => applyHistoryState(e.state);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Esc closes the panel, then leaves explore mode.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const s = useSceneStore.getState();
      if (s.focus) closePanel();
      else if (s.mode === "explore") exitExplore();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // No page scrolling while inside the room.
  useEffect(() => {
    if (mode !== "explore") return;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [mode]);

  const visible = mode === "explore" && !focus;

  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={`pointer-events-none fixed inset-0 z-30 transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <button
        onClick={exitExplore}
        className="glass pointer-events-auto absolute top-20 left-4 inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] tracking-[0.18em] uppercase hover:border-accent/60 sm:top-6 sm:left-6"
      >
        <ArrowLeft size={14} aria-hidden /> Back to page
      </button>

      {/* Camera angle switcher */}
      <div
        role="group"
        aria-label="Camera angle"
        className="glass pointer-events-auto absolute top-32 right-4 left-4 mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-1 overflow-x-auto rounded-full p-1 sm:top-6 sm:right-6 sm:left-auto sm:mx-0"
      >
        <Video size={14} aria-hidden className="mx-2 shrink-0 text-muted" />
        {ANGLES.map((a, i) => (
          <button
            key={a.id}
            onClick={() => setAngle(i)}
            aria-pressed={angle === i}
            className={`shrink-0 rounded-full px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors ${
              angle === i ? "bg-accent text-bg" : "text-muted hover:text-fg"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <nav
        aria-label="Objects in the room"
        className="pointer-events-auto absolute inset-x-4 bottom-5 mx-auto max-w-3xl"
      >
        <p className="mx-auto mb-3 w-fit rounded-full bg-bg/80 px-4 py-1.5 text-center font-mono text-[10px] tracking-[0.25em] text-fg/80 uppercase backdrop-blur">
          <span className="hidden sm:inline">Click an object in the room, or pick one</span>
          <span className="sm:hidden">Tap an object, or pick one</span>
        </p>
        <ul className="flex flex-wrap justify-center gap-2">
          {hotspots.map((h) => (
            <li key={h.id}>
              <button
                onClick={() => openPanel(h.id)}
                aria-label={`${h.title} (${h.object})`}
                className={`glass rounded-full px-4 py-2 text-xs transition-colors hover:border-accent/60 ${
                  hovered === h.id ? "border-accent/70 text-accent" : ""
                }`}
              >
                <span className="font-mono text-[10px] tracking-[0.15em] text-muted uppercase">{h.object}</span>
                <span className="mx-1.5 text-muted/50">·</span>
                {h.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
