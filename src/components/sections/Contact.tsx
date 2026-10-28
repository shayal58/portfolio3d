import { ArrowUpRight, FileText, Github, Linkedin, Mail, MapPin } from "lucide-react";
import { profile } from "@/data/profile";
import { ContactForm } from "@/components/ui/ContactForm";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";

/** Contact: the closing section, with direct links on the left and the form on the right. */
export function Contact() {
  const { links } = profile;
  const rows = [
    { icon: Github, label: "GitHub", value: "github.com/shayal58", href: links.github },
    links.linkedin && { icon: Linkedin, label: "LinkedIn", value: "LinkedIn profile", href: links.linkedin },
    links.resume && { icon: FileText, label: "Resume", value: "Download my resume", href: links.resume },
  ].filter(Boolean) as Array<{ icon: typeof Github; label: string; value: string; href: string }>;

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="pointer-events-auto relative overflow-hidden bg-bg py-24"
    >
      {/* Warm glow behind the form, like the desk lamp in the room */}
      <div aria-hidden className="pointer-events-none absolute -right-40 bottom-0 size-[560px] rounded-full bg-accent/10 blur-[120px]" />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 sm:px-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <Reveal className="min-w-0">
          <p className="font-mono text-xs tracking-[0.3em] text-accent uppercase">Contact</p>
          <h2 id="contact-title" className="mt-3 font-display text-4xl leading-[0.95] font-bold tracking-tight text-balance uppercase sm:text-6xl">
            Let&apos;s build something together.
          </h2>
          <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-muted sm:text-lg">
            Have an idea, project, or opportunity? Let&apos;s connect.
          </p>

          <ul className="mt-8 space-y-3">
            {rows.map((r) => (
              <li key={r.label}>
                <a
                  href={r.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface/60 px-5 py-4 transition-colors hover:border-accent/60"
                >
                  <span className="flex items-center gap-3">
                    <r.icon size={18} aria-hidden className="text-accent" />
                    <span>
                      <span className="block font-mono text-[10px] tracking-[0.25em] text-muted uppercase">{r.label}</span>
                      <span className="block text-sm">{r.value}</span>
                    </span>
                  </span>
                  <ArrowUpRight size={16} aria-hidden className="text-muted transition-colors group-hover:text-accent" />
                </a>
              </li>
            ))}
            {profile.whatsapp && (
              <li>
                <WhatsAppLink />
              </li>
            )}
            {links.email && (
              <li className="flex items-center gap-3 rounded-2xl border border-line bg-surface/60 px-5 py-4">
                <Mail size={18} aria-hidden className="text-accent" />
                <span>
                  <span className="block font-mono text-[10px] tracking-[0.25em] text-muted uppercase">Email</span>
                  <a href={`mailto:${links.email}`} className="block text-sm select-all hover:text-accent">
                    {links.email}
                  </a>
                </span>
              </li>
            )}
            <li className="flex items-center gap-3 px-5 py-2 text-sm text-muted">
              <MapPin size={16} aria-hidden className="text-accent" /> {profile.location}
            </li>
          </ul>
        </Reveal>

        <Reveal delay={120} className="min-w-0">
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
