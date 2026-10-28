import { Github } from "lucide-react";
import { profile } from "@/data/profile";
import { HeroReveal } from "./HeroReveal";
import { ExploreButton, ExploreHint, HeroShell, ProjectsButton } from "./HeroShell";
import { DecodeText } from "@/components/ui/DecodeText";
import { MagneticButton } from "@/components/ui/MagneticButton";

// Hero section. The markup is server-rendered, so it is readable without
// JavaScript or WebGL. The section ignores the pointer except on its text
// and buttons, so the 3D room behind it stays hoverable and clickable.
export function Hero() {
  const nameWords = profile.name.split(" ");

  return (
    <section
      id="home"
      className="pointer-events-none relative flex min-h-svh flex-col justify-end px-6 pb-16 sm:px-12 sm:pb-20"
    >
      <HeroShell>
        {/* Darkens behind the text so it reads over the room. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-bg/95 via-bg/65 via-40% to-transparent to-70% sm:bg-gradient-to-r sm:from-bg/85 sm:via-bg/45 sm:via-30% sm:to-transparent sm:to-55%"
        />
        <HeroReveal>
          <div className="pointer-events-auto max-w-3xl" style={{ opacity: "var(--hero-fade, 1)" }}>
            <p data-reveal className="font-mono text-xs tracking-[0.3em] text-accent uppercase">
              Hello, I&apos;m
            </p>

            <h1 className="mt-3 font-display text-5xl leading-[0.95] font-bold tracking-tight uppercase sm:text-7xl lg:text-8xl">
              {nameWords.map((word, i) => (
                // Each word slides up from behind its own mask.
                <span key={word} data-reveal-mask className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                  <span className="inline-block">
                    {word}
                    {i < nameWords.length - 1 ? " " : ""}
                  </span>
                </span>
              ))}
            </h1>

            <p data-reveal className="mt-4 font-mono text-sm tracking-[0.2em] text-fg/80 uppercase">
              <DecodeText text={profile.tagline} />
            </p>

            <p data-reveal className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {profile.intro}
            </p>

            <div data-reveal className="mt-8 flex flex-wrap gap-3">
              <ExploreButton />
              <ProjectsButton className="glass rounded-full px-6 py-3 font-mono text-xs tracking-[0.18em] uppercase transition-colors hover:border-accent/60">
                View Projects
              </ProjectsButton>
              <MagneticButton
                href={profile.links.github}
                target="_blank"
                rel="noreferrer"
                className="glass rounded-full px-6 py-3 font-mono text-xs tracking-[0.18em] uppercase transition-colors hover:border-accent/60"
              >
                <Github size={14} aria-hidden /> GitHub
              </MagneticButton>
            </div>
          </div>
        </HeroReveal>

        <ExploreHint />
      </HeroShell>
    </section>
  );
}
