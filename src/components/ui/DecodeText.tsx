"use client";

import { useEffect, useState } from "react";
import { useSceneStore } from "@/stores/useSceneStore";
import { INTRO } from "@/lib/intro";

// ============================================
// SECTION 4: ANIMATION CONFIGURATION
// "Decoding" text effect for the role line.
// ============================================
const DECODE = {
  /** Seconds after the hero text starts revealing. */
  delay: 0.45,
  /** Seconds for the whole line to resolve. */
  duration: 1.1,
  glyphs: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/<>",
};

type Props = { text: string; className?: string };

/**
 * Shows random characters that settle, left to right, into the real text.
 * The real text is rendered on the server and announced to screen readers;
 * only the visible glyphs animate.
 */
export function DecodeText({ text, className = "" }: Props) {
  const [shown, setShown] = useState(text);
  const introStart = useSceneStore((s) => s.introStart);

  useEffect(() => {
    if (introStart === null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const startAt = introStart + (INTRO.heroText.start + DECODE.delay) * 1000;
    let raf = 0;
    const tick = () => {
      const p = (performance.now() - startAt) / (DECODE.duration * 1000);
      if (p >= 1) {
        setShown(text);
        return;
      }
      const settled = Math.max(0, Math.floor(p * text.length));
      let out = text.slice(0, settled);
      for (let i = settled; i < text.length; i++) {
        const ch = text[i];
        // Before the effect starts, hide the unsettled part entirely.
        out +=
          ch === " " ? " " : p < 0 ? " " : DECODE.glyphs[(Math.random() * DECODE.glyphs.length) | 0];
      }
      setShown(out);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Real-time safety net: animation frames can stall when the 3D scene
    // is heavy, which would leave the line blank. Always land on the text.
    const endsIn = Math.max(0, startAt + DECODE.duration * 1000 - performance.now());
    const settle = setTimeout(() => {
      cancelAnimationFrame(raf);
      setShown(text);
    }, endsIn + 150);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
    };
  }, [introStart, text]);

  return (
    <span className={className}>
      {/* Screen readers get the real text; the scrambling is visual only. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden>{shown}</span>
    </span>
  );
}
