"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import gsap from "@/lib/gsap";

// ============================================
// SECTION 4: ANIMATION CONFIGURATION
// How strongly buttons follow the cursor.
// ============================================
const MAGNET = { strength: 0.3, textStrength: 0.15, returnEase: "elastic.out(1, 0.4)" };

type Props = ComponentPropsWithoutRef<"a">;

/**
 * A link that drifts toward the cursor while hovered.
 * Off for touch screens and for reduced-motion visitors.
 */
export function MagneticButton({ children, className = "", ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const label = inner.current;
    if (!el || !label) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
    const lxTo = gsap.quickTo(label, "x", { duration: 0.4, ease: "power3.out" });
    const lyTo = gsap.quickTo(label, "y", { duration: 0.4, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * MAGNET.strength);
      yTo(dy * MAGNET.strength);
      lxTo(dx * MAGNET.textStrength);
      lyTo(dy * MAGNET.textStrength);
    };
    const onLeave = () => {
      gsap.to([el, label], { x: 0, y: 0, duration: 0.9, ease: MAGNET.returnEase });
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf([el, label]);
    };
  }, []);

  return (
    <a ref={ref} className={`inline-flex will-change-transform ${className}`} {...rest}>
      <span ref={inner} className="inline-flex items-center gap-2">
        {children}
      </span>
    </a>
  );
}
