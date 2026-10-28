"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, Outlines } from "@react-three/drei";
import * as THREE from "three";
import { useSceneStore } from "@/stores/useSceneStore";
import { hotspotById, type HotspotId } from "@/data/hotspots";
import { openPanel } from "@/lib/navigation";

// ============================================
// SECTION 3: INTERACTIVE OBJECTS
// Wrap any group of meshes in <Interactive id=…>
// to make it clickable. Put <HoverOutline /> inside
// the meshes that should get the orange edge.
// ============================================
const HOVER = { lift: 0.012, scale: 1.035, outline: "#ff642e", ease: 0.18 };

const HoverCtx = createContext(false);

/** Orange edge highlight, shown while the parent <Interactive> is hovered. */
export function HoverOutline({ thickness = 0.006 }: { thickness?: number }) {
  const hovered = useContext(HoverCtx);
  return hovered ? <Outlines thickness={thickness} color={HOVER.outline} /> : null;
}

type Props = {
  id: HotspotId;
  /** Where the tooltip floats, relative to the group. */
  tooltipAt?: [number, number, number];
  children: ReactNode;
} & Omit<React.ComponentProps<"group">, "id" | "children">;

export function Interactive({ id, tooltipAt = [0, 0.25, 0], children, ...group }: Props) {
  const phase = useSceneStore((s) => s.phase);
  const hovered = useSceneStore((s) => s.hovered === id);
  const focused = useSceneStore((s) => s.focus === id);
  const setHovered = useSceneStore((s) => s.setHovered);
  const inner = useRef<THREE.Group>(null);

  // Clickable once the intro is over.
  const enabled = phase === "done";

  useEffect(() => {
    if (!(hovered && enabled)) return;
    document.body.style.cursor = "pointer";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered, enabled]);

  // Clear hover state if this object unmounts while hovered.
  useEffect(() => () => {
    if (useSceneStore.getState().hovered === id) setHovered(null);
  }, [id, setHovered]);

  useFrame(() => {
    if (!inner.current) return;
    const on = hovered && !focused;
    const s = THREE.MathUtils.lerp(inner.current.scale.x, on ? HOVER.scale : 1, HOVER.ease);
    inner.current.scale.setScalar(s);
    inner.current.position.y = THREE.MathUtils.lerp(
      inner.current.position.y,
      on ? HOVER.lift : 0,
      HOVER.ease,
    );
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    if (!enabled) return;
    e.stopPropagation();
    setHovered(id);
  };
  const out = () => {
    if (useSceneStore.getState().hovered === id) setHovered(null);
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    if (!enabled) return;
    e.stopPropagation();
    openPanel(id);
  };

  return (
    <group {...group} onPointerOver={over} onPointerOut={out} onClick={click}>
      <group ref={inner}>
        <HoverCtx.Provider value={hovered && enabled && !focused}>{children}</HoverCtx.Provider>
      </group>
      {hovered && enabled && !focused && (
        <Html position={tooltipAt} center zIndexRange={[40, 0]} style={{ pointerEvents: "none" }}>
          <div className="glass rounded-full px-3.5 py-1.5 font-mono text-[11px] tracking-[0.18em] whitespace-nowrap text-fg uppercase">
            {hotspotById[id].tooltip} <span className="text-accent">→</span>
          </div>
        </Html>
      )}
    </group>
  );
}
