"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fades and lifts its children in the first time they scroll into view.
 * Content is visible by default (no JavaScript, reduced motion, or already
 * on screen); it is only hidden when it starts below the fold.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "hidden" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already visible
    setState("hidden");
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setState("shown");
        io.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        state === "hidden" ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100"
      } ${className}`}
      style={{ transitionDelay: state === "shown" ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
