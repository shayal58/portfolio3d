"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { profile } from "@/data/profile";

/**
 * "Chat on WhatsApp" row. The number is assembled only in the browser after
 * the page loads, which keeps it out of the HTML that simple scrapers read.
 */
export function WhatsAppLink({ compact = false }: { compact?: boolean }) {
  const [num, setNum] = useState<{ intl: string; display: string } | null>(null);

  useEffect(() => {
    const w = profile.whatsapp;
    if (!w) return;
    const local = w.parts.join("");
    setNum({ intl: w.country + local, display: `+${w.country} ${w.parts.join(" ")}` });
  }, []);

  if (!profile.whatsapp) return null;

  const href = num ? `https://wa.me/${num.intl}` : undefined;
  const base = compact
    ? "flex items-center justify-between rounded-2xl border border-line bg-white/[0.03] p-4 hover:border-accent/60"
    : "group flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface/60 px-5 py-4 transition-colors hover:border-accent/60";

  return (
    <a href={href} target="_blank" rel="noreferrer" aria-disabled={!num} className={base}>
      <span className="flex items-center gap-3">
        <MessageCircle size={18} aria-hidden className="text-accent" />
        <span>
          {!compact && <span className="block font-mono text-[10px] tracking-[0.25em] text-muted uppercase">WhatsApp</span>}
          <span className="block text-sm">
            {compact ? "Chat on WhatsApp" : num ? num.display : "Chat on WhatsApp"}
          </span>
        </span>
      </span>
      <ArrowUpRight size={16} aria-hidden className="text-muted transition-colors group-hover:text-accent" />
    </a>
  );
}
