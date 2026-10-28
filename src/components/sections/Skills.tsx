"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { SKILL_CATEGORIES, skillList } from "@/data/skills";
import { projectBySlug } from "@/data/projects";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

const SkillsCanvas = dynamic(() => import("@/components/three/skills/SkillsCanvas"), { ssr: false });

// Same colours as the orbits in SkillsCanvas (kept here so the 3D code
// never loads on devices that can't show it).
const CATEGORY_COLOR = {
  Frontend: "#ff642e",
  Backend: "#ffb347",
  Database: "#6f9bff",
  Tools: "#e9e4dc",
} as const;

/**
 * Skills: a 3D "universe" with one orbit per category, plus a plain list
 * of the same skills. The list is the keyboard / screen-reader / touch
 * route and works without WebGL; both share one selection.
 */
export function Skills() {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [onScreen, setOnScreen] = useState(false);
  // Once loaded, the 3D scene stays mounted and just pauses off screen.
  // (Unmounting it would remove its floating labels twice and throw.)
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (onScreen) setLoaded(true);
  }, [onScreen]);
  const stage = useRef<HTMLDivElement>(null);
  const webgl = useWebGLSupport();
  const reducedMotion = useReducedMotion();
  const show3D = webgl === true;

  // Run the 3D scene only while it is on screen.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: "150px 0px" });
    io.observe(el);
    return () => io.disconnect();
    // The stage only exists once WebGL support is known.
  }, [show3D]);

  // Esc clears the selection.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const skill = skillList.find((s) => s.name === selected) ?? null;

  return (
    <section
      id="skills"
      aria-labelledby="skills-title"
      className="pointer-events-auto relative bg-bg py-24"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-12">
        <header className="max-w-2xl">
          <p className="font-mono text-xs tracking-[0.3em] text-accent uppercase">What I work with</p>
          <h2 id="skills-title" className="mt-3 font-display text-4xl font-bold tracking-tight uppercase sm:text-6xl">
            Skills
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {show3D
              ? "Each orbit is a category. Hover a skill to slow its orbit, or pick one to look closer."
              : "Pick a skill to read more about it."}
          </p>
        </header>

        <div className={`mt-10 grid gap-8 ${show3D ? "lg:grid-cols-[minmax(0,1fr)_320px]" : ""}`}>
          {show3D && (
            <div
              ref={stage}
              className="relative aspect-square w-full overflow-hidden rounded-3xl border border-line bg-[radial-gradient(ellipse_at_center,rgba(255,100,46,0.12),transparent_60%)] sm:aspect-[4/3]"
            >
              {loaded && (
                <SkillsCanvas
                  active={onScreen}
                  selected={selected}
                  hovered={hovered}
                  onSelect={setSelected}
                  onHover={setHovered}
                  still={reducedMotion}
                />
              )}
            </div>
          )}

          <div className="flex flex-col gap-6">
            {/* The list: same skills, same selection */}
            <div className="space-y-5">
              {SKILL_CATEGORIES.map((c) => (
                <div key={c}>
                  <h3 className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-muted uppercase">
                    <span aria-hidden className="size-2 rounded-full" style={{ background: CATEGORY_COLOR[c] }} />
                    {c}
                  </h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {skillList
                      .filter((s) => s.category === c)
                      .map((s) => {
                        const on = s.name === selected;
                        return (
                          <li key={s.name}>
                            <button
                              type="button"
                              aria-pressed={on}
                              onClick={() => setSelected(on ? null : s.name)}
                              onMouseEnter={() => setHovered(s.name)}
                              onMouseLeave={() => setHovered(null)}
                              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                                on
                                  ? "border-accent bg-accent text-bg"
                                  : s.name === hovered
                                    ? "border-accent/60 text-fg"
                                    : "border-line text-fg/85 hover:border-accent/60"
                              }`}
                            >
                              {s.name}
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              ))}
            </div>

            {/* Detail card for the selected skill */}
            <div aria-live="polite" className="min-h-[140px]">
              {skill ? (
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.25em] uppercase" style={{ color: CATEGORY_COLOR[skill.category] }}>
                        {skill.category}
                      </p>
                      <h3 className="mt-1 font-display text-2xl font-semibold">{skill.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      aria-label="Clear selection"
                      className="rounded-full border border-line p-1.5 text-muted hover:border-accent/60 hover:text-fg"
                    >
                      <X size={14} aria-hidden />
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{skill.about}</p>
                  {skill.usedIn.length > 0 && (
                    <p className="mt-3 text-sm">
                      <span className="text-muted">Used in </span>
                      {skill.usedIn.map((slug, i) => {
                        const p = projectBySlug(slug);
                        return p ? (
                          <span key={slug}>
                            {i > 0 && ", "}
                            <Link href={`/projects/${slug}`} className="text-accent hover:text-accent-hover">
                              {p.title}
                            </Link>
                          </span>
                        ) : null;
                      })}
                    </p>
                  )}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-line p-5 text-sm text-muted">
                  Select a skill to see what it is{show3D ? " and fly to it" : ""}.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
