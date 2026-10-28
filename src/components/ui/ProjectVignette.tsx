"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Boxes, ChartColumnIncreasing, Leaf, Shirt, type LucideIcon } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

const VignetteCanvas = dynamic(() => import("@/components/three/vignettes/VignetteCanvas"), {
  ssr: false,
});

type Slug = "agroguard" | "neoth-culture" | "finance-literacy" | "inventory";

const ICONS: Record<Slug, LucideIcon> = {
  agroguard: Leaf,
  "neoth-culture": Shirt,
  "finance-literacy": ChartColumnIncreasing,
  inventory: Boxes,
};

/**
 * Small animated 3D scene for a project. The WebGL canvas exists only
 * while the card is on screen, so at most one or two run at a time. An
 * icon stands in before it loads, and on devices without WebGL.
 */
export function ProjectVignette({ slug, className = "" }: { slug: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const webgl = useWebGLSupport();
  const reducedMotion = useReducedMotion();
  const known = slug in ICONS;
  const Icon = known ? ICONS[slug as Slug] : Boxes;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      rootMargin: "120px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const show3D = known && webgl === true && onScreen;

  return (
    <div
      ref={ref}
      aria-hidden
      className={`relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_60%,rgba(255,100,46,0.16),transparent_65%)] ${className}`}
    >
      {!show3D && (
        <div className="absolute inset-0 grid place-items-center">
          <Icon size={44} strokeWidth={1.2} className="text-accent/70" />
        </div>
      )}
      {show3D && (
        <div className="absolute inset-0">
          <VignetteCanvas slug={slug as Slug} still={reducedMotion} />
        </div>
      )}
    </div>
  );
}
