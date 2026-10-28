import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Github } from "lucide-react";
import { projectBySlug, projects } from "@/data/projects";
import { profile } from "@/data/profile";
import { ProjectVignette } from "@/components/ui/ProjectVignette";

// One static page per project, built ahead of time. Only fields that are
// filled in src/data/projects.ts appear; nothing shows as a placeholder.

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/projects/${p.slug}` },
    openGraph: { type: "article", title: `${p.title} — ${profile.name}`, description: p.summary, url: `/projects/${p.slug}` },
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) notFound();

  const index = projects.findIndex((x) => x.slug === p.slug);
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  const facts = [
    p.role && { label: "Role", value: p.role },
    p.year && { label: "Year", value: p.year },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  const story = [
    p.problem && { title: "The problem", body: p.problem },
    p.solution && { title: "What I built", body: p.solution },
  ].filter(Boolean) as Array<{ title: string; body: string }>;

  return (
    <main id="main" className="min-h-svh bg-bg">
      <nav aria-label="Breadcrumb" className="mx-auto flex max-w-5xl items-center justify-between px-6 pt-8 sm:px-12">
        <Link
          href="/#projects"
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] tracking-[0.18em] uppercase hover:border-accent/60"
        >
          <ArrowLeft size={14} aria-hidden /> All projects
        </Link>
        <span className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
        </span>
      </nav>

      <article className="mx-auto max-w-5xl px-6 pt-12 pb-20 sm:px-12">
        <header>
          <p className="font-mono text-xs tracking-[0.3em] text-accent uppercase">{p.subtitle}</p>
          <h1 className="mt-3 font-display text-5xl leading-[0.95] font-bold tracking-tight text-balance uppercase sm:text-7xl">
            {p.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{p.summary}</p>

          {(p.live || p.repo) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {p.live && (
                <a
                  href={p.live}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-mono text-xs font-medium tracking-[0.18em] text-bg uppercase transition-colors hover:bg-accent-hover"
                >
                  Visit live site <ArrowUpRight size={14} aria-hidden />
                </a>
              )}
              {p.repo && (
                <a
                  href={p.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-xs tracking-[0.18em] uppercase hover:border-accent/60"
                >
                  <Github size={14} aria-hidden /> View code
                </a>
              )}
            </div>
          )}
        </header>

        <ProjectVignette slug={p.slug} className="mt-12 aspect-[16/9] w-full rounded-3xl border border-line bg-surface/50" />

        <div className="mt-14 grid gap-12 md:grid-cols-[minmax(0,1fr)_240px]">
          <div className="min-w-0 space-y-12">
            {story.map((s) => (
              <section key={s.title}>
                <h2 className="font-display text-2xl font-semibold">{s.title}</h2>
                <p className="mt-3 max-w-[65ch] leading-relaxed text-muted">{s.body}</p>
              </section>
            ))}

            {p.features.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-semibold">Features</h2>
                <ul className="mt-4 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-3 leading-relaxed text-muted">
                      <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {p.screenshots.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-semibold">Screenshots</h2>
                <div className="mt-4 grid gap-4">
                  {p.screenshots.map((s) => (
                    <figure key={s.src} className="overflow-hidden rounded-2xl border border-line">
                      <Image src={s.src} alt={s.alt} width={1600} height={1000} className="h-auto w-full" />
                      <figcaption className="px-4 py-2 text-xs text-muted">{s.alt}</figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            )}
          </div>

          {(facts.length > 0 || p.stack.length > 0) && (
            <div aria-label="Project details" role="group" className="space-y-6 md:border-l md:border-line md:pl-8">
              {facts.map((f) => (
                <div key={f.label}>
                  <p className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">{f.label}</p>
                  <p className="mt-1">{f.value}</p>
                </div>
              ))}
              {p.stack.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] tracking-[0.25em] text-muted uppercase">Built with</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {p.stack.map((s) => (
                      <li key={s} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-fg/80">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </article>

      {/* Previous / next project */}
      <nav aria-label="More projects" className="border-t border-line">
        <div className="mx-auto grid max-w-5xl grid-cols-2 px-6 sm:px-12">
          <Link href={`/projects/${prev.slug}`} className="group flex flex-col gap-1 py-8 pr-4">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
              <ArrowLeft size={12} aria-hidden className="transition-transform group-hover:-translate-x-1" /> Previous
            </span>
            <span className="font-display text-lg font-semibold transition-colors group-hover:text-accent sm:text-2xl">{prev.title}</span>
          </Link>
          <Link href={`/projects/${next.slug}`} className="group flex flex-col items-end gap-1 border-l border-line py-8 pl-4 text-right">
            <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
              Next <ArrowRight size={12} aria-hidden className="transition-transform group-hover:translate-x-1" />
            </span>
            <span className="font-display text-lg font-semibold transition-colors group-hover:text-accent sm:text-2xl">{next.title}</span>
          </Link>
        </div>
      </nav>
    </main>
  );
}
