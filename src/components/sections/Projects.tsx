import Link from "next/link";
import { ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { projects } from "@/data/projects";
import { ProjectVignette } from "@/components/ui/ProjectVignette";
import { ScrollDriver } from "./ScrollDriver";

/**
 * Projects gallery. Server-rendered HTML, so it is readable without
 * JavaScript or WebGL. The top of the section is see-through, so the
 * camera's push toward the desk shows while you scroll into it.
 */
export function Projects() {
  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="pointer-events-auto relative scroll-mt-0 bg-gradient-to-b from-transparent via-bg/95 via-[28vh] to-bg pt-[30vh] pb-24"
    >
      <ScrollDriver />
      <div className="mx-auto max-w-6xl px-6 sm:px-12">
        <header className="max-w-2xl">
          <p className="font-mono text-xs tracking-[0.3em] text-accent uppercase">Selected work</p>
          <h2 id="projects-title" className="mt-3 font-display text-4xl font-bold tracking-tight text-balance uppercase sm:text-6xl">
            Projects
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Things I&apos;ve built, from a plant-disease detector to a live brand site. Open any of them for
            the details.
          </p>
        </header>

        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {projects.map((p, i) => (
            <li key={p.slug} className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface/60 transition-colors hover:border-accent/50">
              <ProjectVignette slug={p.slug} className="aspect-[16/10] w-full border-b border-line" />
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-baseline justify-between gap-4 font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
                  <span>{p.subtitle}</span>
                  <span className="tabular-nums">
                    {String(i + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-2xl font-semibold">
                  {/* The whole card is clickable through this link. */}
                  <Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
                    {p.title}
                  </Link>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{p.summary}</p>

                {p.stack.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Built with">
                    {p.stack.map((s) => (
                      <li key={s} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[10px] text-fg/80">
                        {s}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6 font-mono text-[11px] tracking-[0.15em] uppercase">
                  <span className="inline-flex items-center gap-1.5 text-fg transition-colors group-hover:text-accent">
                    Case study <ArrowRight size={13} aria-hidden className="transition-transform group-hover:translate-x-1" />
                  </span>
                  {/* External links sit above the card-wide link. */}
                  {p.live && (
                    <a href={p.live} target="_blank" rel="noreferrer" className="relative z-10 inline-flex items-center gap-1 text-muted hover:text-accent">
                      Live site <ArrowUpRight size={12} aria-hidden />
                    </a>
                  )}
                  {p.repo && (
                    <a href={p.repo} target="_blank" rel="noreferrer" className="relative z-10 inline-flex items-center gap-1 text-muted hover:text-accent">
                      <Github size={12} aria-hidden /> Code
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
