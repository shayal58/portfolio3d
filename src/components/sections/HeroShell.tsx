"use client";

import type { ReactNode } from "react";
import { Compass, MousePointerClick } from "lucide-react";
import { useSceneStore } from "@/stores/useSceneStore";
import { openExplore } from "@/lib/navigation";
import { scrollToSection } from "@/lib/scroll";
import { MagneticButton } from "@/components/ui/MagneticButton";

/** Fades the hero out while the visitor explores the room. */
export function HeroShell({ children }: { children: ReactNode }) {
  const explore = useSceneStore((s) => s.mode === "explore");
  return (
    <div
      aria-hidden={explore}
      inert={explore}
      className={`transition-opacity duration-700 ${explore ? "opacity-0" : "opacity-100"}`}
    >
      {children}
    </div>
  );
}

/** "Explore my world" — only offered when the 3D room is actually there. */
export function ExploreButton() {
  const noWebGL = useSceneStore((s) => s.noWebGL);
  if (noWebGL) return null;
  return (
    <MagneticButton
      href="#explore"
      onClick={(e) => {
        e.preventDefault();
        openExplore();
      }}
      className="rounded-full bg-accent px-6 py-3 font-mono text-xs font-medium tracking-[0.18em] text-bg uppercase transition-colors hover:bg-accent-hover"
    >
      <Compass size={14} aria-hidden /> Explore my world
    </MagneticButton>
  );
}

/** "View projects": scrolls down to the Projects section. */
export function ProjectsButton({ className, children }: { className: string; children: ReactNode }) {
  return (
    <MagneticButton
      href="#projects"
      onClick={(e) => {
        e.preventDefault();
        scrollToSection("projects");
      }}
      className={className}
    >
      {children}
    </MagneticButton>
  );
}

/** Small "Explore the room" prompt in the corner; hidden when there is no 3D room. */
export function ExploreHint() {
  const noWebGL = useSceneStore((s) => s.noWebGL);
  if (noWebGL) return null;
  return (
    <button
      type="button"
      onClick={openExplore}
      style={{ opacity: "var(--hero-fade, 1)" }}
      className="pointer-events-auto absolute right-6 bottom-8 hidden items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-muted uppercase transition-colors hover:text-fg sm:right-12 sm:flex"
    >
      Click the room to explore <MousePointerClick size={12} aria-hidden className="animate-pulse" />
    </button>
  );
}
