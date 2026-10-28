"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Github, MapPin, X } from "lucide-react";
import { useSceneStore } from "@/stores/useSceneStore";
import { hotspotById, type HotspotId } from "@/data/hotspots";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { skills } from "@/data/skills";
import { closePanel } from "@/lib/navigation";
import { WhatsAppLink } from "./WhatsAppLink";

/**
 * Glass panel that opens beside the focused object: on the right on wide
 * screens, as a bottom sheet on phones. Content comes from src/data.
 * Phases 4–6 replace these simple views with the full sections.
 */
export function SectionPanel() {
  const focus = useSceneStore((s) => s.focus);
  const closeBtn = useRef<HTMLButtonElement>(null);

  // Move keyboard focus into the panel when it opens.
  useEffect(() => {
    if (focus) closeBtn.current?.focus({ preventScroll: true });
  }, [focus]);

  const open = focus !== null;
  const titleId = "section-panel-title";

  return (
    <aside
      role="dialog"
      aria-labelledby={titleId}
      aria-hidden={!open}
      inert={!open}
      className={`glass fixed z-40 flex flex-col overflow-hidden rounded-t-3xl transition-[opacity,transform] duration-500 ease-out
        inset-x-0 bottom-0 max-h-[58svh]
        sm:inset-x-auto sm:top-24 sm:right-6 sm:bottom-6 sm:max-h-none sm:w-[420px] sm:rounded-3xl
        ${open ? "translate-y-0 opacity-100 sm:translate-x-0" : "pointer-events-none translate-y-8 opacity-0 sm:translate-x-8 sm:translate-y-0"}`}
    >
      {focus && (
        <>
          <header className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-accent uppercase">
                {hotspotById[focus].object}
              </p>
              <h2 id={titleId} className="font-display text-2xl font-semibold">
                {hotspotById[focus].title}
              </h2>
            </div>
            <button
              ref={closeBtn}
              onClick={closePanel}
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] tracking-[0.18em] uppercase hover:border-accent/60"
            >
              <X size={14} aria-hidden /> Back
            </button>
          </header>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <PanelBody id={focus} />
          </div>
        </>
      )}
    </aside>
  );
}

function PanelBody({ id }: { id: HotspotId }) {
  switch (id) {
    case "projects":
      return (
        <ul className="space-y-4">
          {projects.map((p) => (
            <li key={p.slug} className="rounded-2xl border border-line bg-white/[0.03] p-4">
              <p className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">{p.subtitle}</p>
              <h3 className="mt-1 font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.summary}</p>
              {p.stack.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {p.stack.map((s) => (
                    <li key={s} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[10px] text-fg/80">
                      {s}
                    </li>
                  ))}
                </ul>
              )}
              {(
                <div className="mt-3 flex flex-wrap gap-4 font-mono text-[11px] tracking-[0.15em] uppercase">
                  <Link href={`/projects/${p.slug}`} className="inline-flex items-center gap-1 text-fg hover:text-accent">
                    Case study <ArrowUpRight size={12} aria-hidden />
                  </Link>
                  {p.repo && (
                    <a href={p.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent hover:text-accent-hover">
                      Code <ArrowUpRight size={12} aria-hidden />
                    </a>
                  )}
                  {p.live && (
                    <a href={p.live} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent hover:text-accent-hover">
                      Live <ArrowUpRight size={12} aria-hidden />
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      );

    case "skills":
      return (
        <div className="space-y-5">
          {Object.entries(skills).map(([group, items]) => (
            <section key={group}>
              <h3 className="font-mono text-[10px] tracking-[0.3em] text-muted uppercase">{group}</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {items.map((s) => (
                  <li key={s} className="rounded-full border border-line bg-white/[0.03] px-3 py-1 text-sm">
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      );

    case "education":
      return (
        <div className="rounded-2xl border border-line bg-white/[0.03] p-4">
          <h3 className="font-display text-lg font-semibold">{profile.education.college}</h3>
          <p className="mt-1 text-sm text-muted">{profile.education.field}</p>
        </div>
      );

    case "work":
      return (
        <div className="rounded-2xl border border-line bg-white/[0.03] p-4">
          <p className="font-mono text-[10px] tracking-[0.25em] text-accent uppercase">Current</p>
          <h3 className="mt-1 font-display text-lg font-semibold">{profile.work.company}</h3>
          {profile.work.role && <p className="mt-1 text-sm text-muted">{profile.work.role}</p>}
          {profile.work.since && <p className="mt-1 text-sm text-muted">Since {profile.work.since}</p>}
        </div>
      );

    case "contact":
      return (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-muted">Have an idea, project, or opportunity? Let&apos;s connect.</p>
          <a
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-2xl border border-line bg-white/[0.03] p-4 hover:border-accent/60"
          >
            <span className="inline-flex items-center gap-3">
              <Github size={18} aria-hidden /> GitHub
            </span>
            <ArrowUpRight size={16} aria-hidden className="text-accent" />
          </a>
          <WhatsAppLink compact />
          {profile.links.email && (
            <a href={`mailto:${profile.links.email}`} className="block rounded-2xl border border-line bg-white/[0.03] p-4 hover:border-accent/60">
              {profile.links.email}
            </a>
          )}
          {profile.links.linkedin && (
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="block rounded-2xl border border-line bg-white/[0.03] p-4 hover:border-accent/60">
              LinkedIn
            </a>
          )}
          <p className="inline-flex items-center gap-2 pt-1 text-sm text-muted">
            <MapPin size={14} aria-hidden /> {profile.location}
          </p>
        </div>
      );

    case "about":
      return (
        <div>
          <div className="relative mx-auto aspect-[4/5] w-48 overflow-hidden rounded-2xl border border-line shadow-[0_0_40px_rgba(255,100,46,0.18)]">
            <Image src={profile.photo} alt={`Photo of ${profile.name}`} fill sizes="192px" className="object-cover" />
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted">
            Hi, I&apos;m {profile.name}, a developer based in {profile.location}. With a background in{" "}
            {profile.education.field}, I enjoy building digital solutions, exploring new technologies, and
            combining functionality with thoughtful design.
          </p>
          <p className="mt-4 text-xs text-muted/70">
            This room is modelled on my own workspace in Bharatpur.
          </p>
        </div>
      );
  }
}
