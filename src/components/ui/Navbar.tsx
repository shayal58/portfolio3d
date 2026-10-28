"use client";

import { useEffect, useState } from "react";
import { useSceneStore } from "@/stores/useSceneStore";
import { scrollToSection } from "@/lib/scroll";
import { GlassPanel } from "./GlassPanel";

// Each link scrolls to its section on the page, and the link for the
// section you're reading is highlighted. They're real #anchors, so they
// also work without JavaScript. Hidden while exploring the room: "Back to
// page" and the angle switcher take its place there.
const LINKS = [
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const;

type SectionId = (typeof LINKS)[number]["id"];

/** The section whose top has passed 40% of the screen height, if any. */
function useActiveSection(): SectionId | null {
  const [active, setActive] = useState<SectionId | null>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.4;
      let current: SectionId | null = null;
      for (const l of LINKS) {
        const el = document.getElementById(l.id);
        if (el && el.getBoundingClientRect().top <= line) current = l.id;
      }
      // At the very bottom, the last section counts even if it's short.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = "contact";
      setActive(current);
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
  return active;
}

export function Navbar() {
  const explore = useSceneStore((s) => s.mode === "explore");
  const active = useActiveSection();

  return (
    <header
      aria-hidden={explore}
      inert={explore}
      className={`fixed inset-x-0 top-4 z-50 flex justify-center px-4 transition-opacity duration-500 ${
        explore ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <GlassPanel as="nav" aria-label="Main" className="max-w-full overflow-x-auto px-1.5 py-1.5 sm:px-2">
        <ul className="flex items-center font-mono text-[10px] tracking-[0.08em] uppercase sm:gap-1 sm:text-xs sm:tracking-[0.18em]">
          {LINKS.map((link) => {
            const on = active === link.id;
            return (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  aria-current={on ? "location" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.id);
                  }}
                  className={`relative block rounded-xl px-2.5 py-2 whitespace-nowrap transition-colors sm:px-3 ${
                    on ? "bg-white/[0.07] text-fg" : "text-muted hover:bg-white/5 hover:text-fg"
                  }`}
                >
                  {link.label}
                  {/* Orange indicator under the active link */}
                  <span
                    aria-hidden
                    className={`absolute inset-x-3 bottom-1 h-px origin-center bg-accent transition-transform duration-300 ${
                      on ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </GlassPanel>
    </header>
  );
}
