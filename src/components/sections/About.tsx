import { Briefcase, GraduationCap, MapPin } from "lucide-react";
import { profile } from "@/data/profile";
import { ParallaxPhoto } from "@/components/ui/ParallaxPhoto";
import { Reveal } from "@/components/ui/Reveal";

/**
 * About: portrait on the left, introduction and background on the right.
 * Fields not yet confirmed in src/data/profile.ts (job title, start year)
 * are left out rather than shown as placeholders.
 */
export function About() {
  const { education, work } = profile;

  return (
    <section id="about" aria-labelledby="about-title" className="pointer-events-auto relative bg-bg py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 sm:px-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Reveal>
          <ParallaxPhoto src={profile.photo} alt={`Portrait of ${profile.name} by a river in Chitwan`} />
        </Reveal>

        <div className="min-w-0">
          <Reveal>
            <p className="font-mono text-xs tracking-[0.3em] text-accent uppercase">Get to know me</p>
            <h2 id="about-title" className="mt-3 font-display text-4xl font-bold tracking-tight text-balance uppercase sm:text-6xl">
              Beyond the code
            </h2>
          </Reveal>

          <Reveal delay={80}>
            <p className="mt-6 max-w-[60ch] text-base leading-relaxed text-fg/85 sm:text-lg">
              Hi, I&apos;m {profile.name}, a developer based in {profile.location}. With a background in{" "}
              {education.field}, I enjoy building digital solutions, exploring new technologies, and combining
              functionality with thoughtful design.
            </p>
            <p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-muted">
              The room at the top of this page is modelled on my own workspace in Bharatpur.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Reveal delay={140}>
              <div className="h-full rounded-2xl border border-line bg-surface/60 p-5">
                <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
                  <GraduationCap size={14} aria-hidden className="text-accent" /> Education
                </p>
                <h3 className="mt-3 font-display text-lg font-semibold">{education.college}</h3>
                <p className="mt-1 text-sm text-muted">{education.field}</p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="h-full rounded-2xl border border-line bg-surface/60 p-5">
                <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-muted uppercase">
                  <Briefcase size={14} aria-hidden className="text-accent" /> Work
                </p>
                <h3 className="mt-3 font-display text-lg font-semibold">{work.company}</h3>
                <p className="mt-1 text-sm text-muted">
                  {[work.role, work.since ? `since ${work.since}` : null].filter(Boolean).join(", ") || "Current workplace"}
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={260}>
            <p className="mt-6 inline-flex items-center gap-2 text-sm text-muted">
              <MapPin size={14} aria-hidden className="text-accent" /> {profile.location}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
