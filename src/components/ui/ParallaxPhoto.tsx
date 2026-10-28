"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

// ============================================
// SECTION 4: ANIMATION CONFIGURATION
// How far the portrait tilts toward the cursor.
// ============================================
const TILT = { deg: 6, shift: 10 };

/** Portrait in a glass frame with an orange glow; tilts toward the cursor on desktop. */
export function ParallaxPhoto({ src, alt }: { src: string; alt: string }) {
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - (r.left + r.width / 2)) / window.innerWidth) * 2;
        const y = ((e.clientY - (r.top + r.height / 2)) / window.innerHeight) * 2;
        el.style.setProperty("--rx", `${(-y * TILT.deg).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${(x * TILT.deg).toFixed(2)}deg`);
        el.style.setProperty("--px", `${(-x * TILT.shift).toFixed(1)}px`);
        el.style.setProperty("--py", `${(-y * TILT.shift).toFixed(1)}px`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div className="[perspective:900px]">
      <div
        ref={frame}
        className="glass relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[28px] p-2 shadow-[0_0_80px_rgba(255,100,46,0.22)] transition-transform duration-300 ease-out"
        style={{ transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))" }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[22px]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 384px, 90vw"
            className="scale-110 object-cover transition-transform duration-300 ease-out"
            style={{ translate: "var(--px, 0px) var(--py, 0px)" }}
          />
          {/* Warm light from below, matching the room's palette */}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-accent/25 via-transparent to-transparent mix-blend-soft-light" />
        </div>
        {/* Animated orange edge */}
        <div aria-hidden className="about-edge pointer-events-none absolute inset-0 rounded-[28px]" />
      </div>
    </div>
  );
}
