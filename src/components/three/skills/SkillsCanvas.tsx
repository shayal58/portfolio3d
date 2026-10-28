"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { SKILL_CATEGORIES, skillList, type SkillCategory } from "@/data/skills";

// ============================================
// SECTION 4: ANIMATION CONFIGURATION
// Skills universe: a glowing core with one orbit
// per category. Hovering a skill slows its orbit;
// selecting one stops it and the camera moves in.
// ============================================
export const CATEGORY_COLOR: Record<SkillCategory, string> = {
  Frontend: "#ff642e",
  Backend: "#ffb347",
  Database: "#6f9bff",
  Tools: "#e9e4dc",
};
const ORBITS: Record<SkillCategory, { radius: number; tilt: [number, number]; speed: number }> = {
  Frontend: { radius: 1.55, tilt: [0.35, 0.1], speed: 0.22 },
  Backend: { radius: 2.2, tilt: [-0.25, 0.5], speed: -0.16 },
  Database: { radius: 2.8, tilt: [0.5, -0.4], speed: 0.13 },
  Tools: { radius: 3.4, tilt: [-0.15, -0.15], speed: -0.1 },
};
const HOVER_SLOW = 0.15; // orbit speed multiplier while one of its skills is hovered
const CAMERA_HOME = new THREE.Vector3(0, 1.4, 8.6);
const CAMERA_EASE = 0.06;
/** How far the camera stays from a selected skill. */
const FOCUS_DISTANCE = 3.4;

type Props = {
  /** False while off screen: the scene stops drawing but stays loaded. */
  active?: boolean;
  selected: string | null;
  hovered: string | null;
  onSelect: (name: string | null) => void;
  onHover: (name: string | null) => void;
  still: boolean;
};

export default function SkillsCanvas(props: Props) {
  return (
    <Canvas
      aria-hidden
      dpr={[1, 1.75]}
      frameloop={props.active === false ? "never" : "always"}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      camera={{ fov: 40, position: CAMERA_HOME.toArray() }}
      onPointerMissed={() => props.onSelect(null)}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} intensity={14} color="#ff8a4f" distance={7} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} color="#ffffff" />
      <Universe {...props} />
    </Canvas>
  );
}

function Universe({ selected, hovered, onSelect, onHover, still }: Omit<Props, "active">) {
  const core = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  // One angle per category; advanced each frame.
  const angles = useRef<Record<string, number>>(
    Object.fromEntries(SKILL_CATEGORIES.map((c, i) => [c, i * 0.9])),
  );
  const nodeRefs = useRef<Record<string, THREE.Group | null>>({});
  const camTarget = useMemo(() => new THREE.Vector3(), []);
  const camPos = useMemo(() => new THREE.Vector3(), []);
  const lookAt = useRef(new THREE.Vector3());
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const euler = useMemo(() => new THREE.Euler(), []);
  const lift = useMemo(() => new THREE.Vector3(0, 0.35, 0), []);
  const sway = useMemo(() => new THREE.Vector3(), []);

  const selectedSkill = skillList.find((s) => s.name === selected) ?? null;
  const hoveredSkill = skillList.find((s) => s.name === hovered) ?? null;

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!still) {
      for (const c of SKILL_CATEGORIES) {
        let k = 1;
        if (selectedSkill?.category === c) k = 0;
        else if (hoveredSkill?.category === c) k = HOVER_SLOW;
        angles.current[c] += ORBITS[c].speed * k * dt;
      }
      if (core.current) core.current.rotation.y += dt * 0.25;
      if (shell.current) {
        shell.current.rotation.y -= dt * 0.12;
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.03;
        shell.current.scale.setScalar(pulse);
      }
    }

    // Place each skill on its orbit.
    const perCategory: Record<string, number> = {};
    for (const s of skillList) {
      const g = nodeRefs.current[s.name];
      if (!g) continue;
      const i = (perCategory[s.category] = (perCategory[s.category] ?? -1) + 1);
      const count = skillList.filter((x) => x.category === s.category).length;
      const o = ORBITS[s.category];
      const a = angles.current[s.category] + (i / count) * Math.PI * 2;
      tmp.set(Math.cos(a) * o.radius, 0, Math.sin(a) * o.radius);
      tmp.applyEuler(euler.set(o.tilt[0], 0, o.tilt[1]));
      g.position.copy(tmp);
      // Hovered or selected nodes swell a little.
      const big = s.name === selected ? 1.3 : s.name === hovered ? 1.3 : 1;
      g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, big, 0.15));
    }

    // Camera: home view with a little cursor sway, or close to the selected skill.
    const selNode = selected ? nodeRefs.current[selected] : null;
    if (selNode) {
      camTarget.copy(selNode.position);
      // Stand off toward the home camera, so the core stays in view behind it.
      camPos.copy(selNode.position).add(tmp.copy(CAMERA_HOME).sub(selNode.position).normalize().multiplyScalar(FOCUS_DISTANCE)).add(lift);
    } else {
      camTarget.set(0, 0, 0);
      camPos.copy(CAMERA_HOME);
      if (!still) camPos.add(sway.set(state.pointer.x * 0.6, state.pointer.y * 0.4, 0));
    }
    const ease = still ? 1 : CAMERA_EASE;
    state.camera.position.lerp(camPos, ease);
    lookAt.current.lerp(camTarget, ease);
    state.camera.lookAt(lookAt.current);
  });

  return (
    <group>
      {/* Core */}
      <mesh ref={core}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial color="#2a1208" emissive="#ff642e" emissiveIntensity={1.4} flatShading />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshBasicMaterial color="#ff8a4f" wireframe transparent opacity={0.3} />
      </mesh>

      {/* Orbit rings */}
      {SKILL_CATEGORIES.map((c) => (
        <mesh key={c} rotation={[ORBITS[c].tilt[0] + Math.PI / 2, 0, ORBITS[c].tilt[1]]}>
          <torusGeometry args={[ORBITS[c].radius, 0.006, 6, 160]} />
          <meshBasicMaterial
            color={CATEGORY_COLOR[c]}
            transparent
            opacity={selectedSkill?.category === c || hoveredSkill?.category === c ? 0.6 : 0.18}
          />
        </mesh>
      ))}

      {/* Skill nodes */}
      {skillList.map((s) => {
        const color = CATEGORY_COLOR[s.category];
        const active = s.name === selected || s.name === hovered;
        const over = (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(s.name);
          document.body.style.cursor = "pointer";
        };
        const out = () => {
          onHover(null);
          document.body.style.cursor = "";
        };
        return (
          <group key={s.name} ref={(g) => { nodeRefs.current[s.name] = g; }}>
            <mesh
              onPointerOver={over}
              onPointerOut={out}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(s.name === selected ? null : s.name);
              }}
            >
              <sphereGeometry args={[0.14, 24, 24]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 2.2 : 0.8} toneMapped={false} />
            </mesh>
            {/* Larger invisible hit area, so small nodes are easy to hover */}
            <mesh onPointerOver={over} onPointerOut={out} onClick={(e) => { e.stopPropagation(); onSelect(s.name === selected ? null : s.name); }}>
              <sphereGeometry args={[0.32, 8, 8]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            <Html center position={[0, 0.34, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
              <div
                className={`rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] whitespace-nowrap uppercase transition-[color,border-color,opacity] ${
                  active ? "border-accent bg-bg/90 text-fg" : "border-line bg-bg/70 text-fg/80"
                } ${selected && !active ? "opacity-30" : "opacity-100"}`}
              >
                {s.name}
                {active && <span className="ml-1.5 text-muted normal-case">· {s.category}</span>}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
